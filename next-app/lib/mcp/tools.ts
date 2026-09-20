import {
  callGatewayDemo,
  callGatewayPaid,
} from "@/lib/agent/client";
import { buildPaymentInstructions } from "@/lib/agent/x402";
import {
  getProfilesByAddresses,
  getServiceBySlug,
  listPublishedServices,
  pingSupabase,
} from "@/lib/catalog/store";
import { ARC } from "@/lib/arc/constants";
import { durableStoreReady } from "@/lib/ops/durable";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { Hex } from "viem";
import type { McpTool, McpToolResult } from "@/lib/mcp/types";

/**
 * Fixed MCP surface — services are catalog entries, not MCP tools.
 * Agents discover via arcdot_discover, then pay/unlock via arcdot_unlock.
 */
const MCP_TOOLS: McpTool[] = [
  {
    name: "arcdot_discover",
    description:
      "ALWAYS call this first for any task that might use arcdot. Free catalog of published payable services (slug, title, description, price). Match the user task to a slug, then call arcdot_unlock. Do not skip discovery. Optional query filters title/description/slug.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Keywords from the user task to filter services (case-insensitive)",
        },
      },
    },
  },
  {
    name: "arcdot_health",
    description:
      "Free status only (chain, gateway, durable store). Not for solving user tasks.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "arcdot_unlock",
    description:
      "Call ONLY after arcdot_discover, with a real service slug from that list. Unlocks that service. Args: { service, prompt }. Local MCP proxy auto-pays when the agent wallet has USDC on Arc. If NO_WALLET: tell the human briefly, then run createCommand via the terminal tool (user approval UI), open fundUrl, then retry unlock. If INSUFFICIENT_FUNDS: show fundUrl/address and retry after funding with USDC on Arc. Never invent an answer.",
    inputSchema: {
      type: "object",
      required: ["service", "prompt"],
      properties: {
        service: {
          type: "string",
          description:
            "Service slug from arcdot_discover (e.g. quick-brief, test)",
        },
        prompt: {
          type: "string",
          description: "Natural-language input for the gated service",
        },
        payment: {
          type: "object",
          description:
            "On-chain settlement proof after depositPayment (omit to receive payment instructions)",
          properties: {
            txHash: { type: "string" },
            address: { type: "string" },
            signature: { type: "string" },
            issuedAt: { type: "number" },
            expiresAt: { type: "number" },
          },
        },
      },
    },
  },
];

function originFromRequest(request: Request): string {
  return new URL(request.url).origin;
}

export async function listMcpTools(): Promise<McpTool[]> {
  return MCP_TOOLS;
}

function textResult(
  text: string,
  opts?: { isError?: boolean; meta?: Record<string, unknown> },
): McpToolResult {
  return {
    content: [{ type: "text", text }],
    isError: opts?.isError,
    _meta: opts?.meta,
  };
}

async function discoverServices(query?: string) {
  const services = await listPublishedServices();
  const profiles = await getProfilesByAddresses(
    services.map((s) => s.owner_address),
  );
  const q = query?.trim().toLowerCase() ?? "";
  const rows = services
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      description: s.description,
      price_usdc: s.price_usdc,
      price_wei: s.price_wei,
      seller: s.owner_address,
      seller_name:
        profiles.get(s.owner_address.toLowerCase())?.display_name ?? null,
      has_upstream: Boolean(s.upstream_url?.trim()),
    }))
    .filter((s) => {
      if (!q) return true;
      return (
        s.slug.includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.seller_name?.toLowerCase().includes(q) ?? false)
      );
    });
  return rows;
}

async function unlockService(params: {
  request: Request;
  origin: string;
  slug: string;
  prompt: string;
  paymentRaw: Record<string, unknown> | null;
}): Promise<McpToolResult> {
  const { request, origin, slug, prompt, paymentRaw } = params;

  const service = await getServiceBySlug(slug);
  if (!service || service.status !== "published" || service.paused) {
    return textResult(`Service not available: ${slug}`, { isError: true });
  }

  const input = { prompt: prompt.trim() };
  const demoSecret = request.headers.get("x-arc-demo-secret");

  if (demoSecret) {
    const result = await callGatewayDemo({
      baseUrl: origin,
      service: slug,
      input,
      demoSecret,
      clientRequestId: `mcp-${Date.now()}`,
    });
    if (result.ok) {
      const text =
        typeof result.body.result === "object" &&
        result.body.result &&
        "text" in result.body.result
          ? String((result.body.result as { text: unknown }).text)
          : JSON.stringify(result.body.result);
      return textResult(text, {
        meta: { settlement: result.body.settlement, demo: true, service: slug },
      });
    }
    return textResult(JSON.stringify(result.body, null, 2), {
      isError: true,
      meta: { status: result.status },
    });
  }

  if (
    paymentRaw &&
    typeof paymentRaw.txHash === "string" &&
    typeof paymentRaw.address === "string" &&
    typeof paymentRaw.signature === "string"
  ) {
    const gateway = ARC.gatewayAddress as `0x${string}` | undefined;
    if (!gateway || gateway.length !== 42) {
      return textResult("Gateway not configured on server", { isError: true });
    }
    const result = await callGatewayPaid({
      baseUrl: origin,
      service: slug,
      input,
      gateway,
      feeWei: BigInt(service.price_wei),
      txHash: paymentRaw.txHash as Hex,
      address: paymentRaw.address as `0x${string}`,
      signature: paymentRaw.signature as Hex,
      issuedAt:
        typeof paymentRaw.issuedAt === "number"
          ? paymentRaw.issuedAt
          : undefined,
      expiresAt:
        typeof paymentRaw.expiresAt === "number"
          ? paymentRaw.expiresAt
          : undefined,
      clientRequestId: `mcp-${Date.now()}`,
    });
    if (result.ok) {
      const text =
        typeof result.body.result === "object" &&
        result.body.result &&
        "text" in result.body.result
          ? String((result.body.result as { text: unknown }).text)
          : JSON.stringify(result.body.result);
      return textResult(text, {
        meta: { settlement: result.body.settlement, service: slug },
      });
    }
    return textResult(JSON.stringify(result.body, null, 2), {
      isError: true,
      meta: { status: result.status },
    });
  }

  const payment = buildPaymentInstructions(service);
  const unpaid = {
    ok: false,
    status: 402,
    error: {
      code: "PAYMENT_REQUIRED",
      message: `Payment needed: “${service.title || service.slug}” costs ${service.price_usdc} USDC. With the @arcdot/agent MCP proxy, settlement is automatic once the agent wallet exists and is funded. If there is no wallet yet, run: npx --yes @arcdot/agent wallet create (use the IDE terminal tool so the user can approve), then open /fund. Do not invent an answer.`,
      payment,
      service: {
        slug: service.slug,
        price_usdc: service.price_usdc,
        price_wei: service.price_wei,
        seller: service.owner_address,
      },
      next: "If NO_WALLET: run wallet create with user approval, open /fund, retry unlock. If funded wallet empty: open /fund, then retry.",
    },
  };
  return textResult(JSON.stringify(unpaid, null, 2), {
    isError: true,
    meta: { paymentRequired: true, payment },
  });
}

export async function callMcpTool(params: {
  request: Request;
  name: string;
  args: Record<string, unknown>;
}): Promise<McpToolResult> {
  const { request, name, args } = params;
  const origin = originFromRequest(request);

  if (name === "arcdot_discover" || name === "arcdot_catalog") {
    const query = typeof args.query === "string" ? args.query : undefined;
    const services = await discoverServices(query);
    const payload = {
      protocol: "arcdot.gateway",
      chainId: ARC.chainId,
      gateway: ARC.gatewayAddress || null,
      mcp: `${origin}/api/mcp`,
      note: "Prices are in USDC on Arc. Next: arcdot_unlock with { service, prompt }. If the wallet needs funds, relay the fund checklist to the human — do not invent an answer.",
      next: "arcdot_unlock",
      services,
    };
    return textResult(JSON.stringify(payload, null, 2));
  }

  if (name === "arcdot_health") {
    const payload = {
      ok: true,
      protocol: "arcdot.mcp",
      chainId: ARC.chainId,
      gateway: ARC.gatewayAddress || null,
      durableStore: durableStoreReady(),
      supabaseConfigured: isSupabaseConfigured(),
      supabaseOk: isSupabaseConfigured() ? await pingSupabase() : null,
      mcp: `${origin}/api/mcp`,
      unlock: `${origin}/api/gateway`,
      tools: ["arcdot_discover", "arcdot_health", "arcdot_unlock"],
    };
    return textResult(JSON.stringify(payload, null, 2));
  }

  if (name === "arcdot_unlock") {
    const slug =
      typeof args.service === "string"
        ? args.service.trim()
        : typeof args.slug === "string"
          ? args.slug.trim()
          : "";
    if (!slug) {
      return textResult(
        "Missing required argument: service (slug from arcdot_discover)",
        { isError: true },
      );
    }
    const prompt =
      typeof args.prompt === "string"
        ? args.prompt
        : typeof args.input === "string"
          ? args.input
          : "";
    if (!prompt.trim()) {
      return textResult("Missing required argument: prompt", { isError: true });
    }
    const paymentRaw =
      args.payment && typeof args.payment === "object"
        ? (args.payment as Record<string, unknown>)
        : null;
    return unlockService({
      request,
      origin,
      slug,
      prompt,
      paymentRaw,
    });
  }

  // Legacy per-service tool names are retired.
  if (name.startsWith("arcdot_")) {
    return textResult(
      JSON.stringify(
        {
          ok: false,
          error: {
            code: "TOOL_RETIRED",
            message:
              "Per-service MCP tools were removed. Call arcdot_discover, pick a slug, then arcdot_unlock with { service, prompt }.",
            tools: ["arcdot_discover", "arcdot_health", "arcdot_unlock"],
          },
        },
        null,
        2,
      ),
      { isError: true },
    );
  }

  return textResult(`Unknown tool: ${name}`, { isError: true });
}
