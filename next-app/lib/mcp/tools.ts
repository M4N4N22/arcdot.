import {
  callGatewayDemo,
  callGatewayPaid,
} from "@/lib/agent/client";
import {
  agentPrivateKeyFromEnv,
  runPaidAgentRequest,
} from "@/lib/agent/paidRequest";
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
import {
  slugFromToolName,
  toolNameForSlug,
  type McpTool,
  type McpToolResult,
} from "@/lib/mcp/types";

function originFromRequest(request: Request): string {
  return new URL(request.url).origin;
}

export async function listMcpTools(): Promise<McpTool[]> {
  const services = await listPublishedServices();
  const profiles = await getProfilesByAddresses(
    services.map((s) => s.owner_address),
  );

  const meta: McpTool[] = [
    {
      name: "arcdot_catalog",
      description:
        "List payable arcdot. services (slug, price_wei 18-decimal native USDC, seller). Free discovery — no payment.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "arcdot_health",
      description:
        "Check arcdot. gateway health (chain, durable store, gateway address). Free.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ];

  const serviceTools: McpTool[] = services.map((s) => {
    const sellerName =
      profiles.get(s.owner_address.toLowerCase())?.display_name ?? null;
    return {
      name: toolNameForSlug(s.slug),
      description: [
        s.title,
        s.description,
        `Price: ${s.price_usdc} USDC (price_wei=${s.price_wei}, 18 decimals).`,
        `Seller: ${s.owner_address}${sellerName ? ` (${sellerName})` : ""}.`,
        s.upstream_url?.trim()
          ? "Fulfillment: seller upstream API."
          : "Fulfillment: arcdot. hosted model.",
        "Pay via Arc PromptGateway.depositPayment then call with payment args, or use X-Arc-Demo-Secret for rehearsal.",
      ].join(" "),
      inputSchema: {
        type: "object",
        required: ["prompt"],
        properties: {
          prompt: {
            type: "string",
            description: "Natural-language input for this gated service",
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
    };
  });

  return [...meta, ...serviceTools];
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

export async function callMcpTool(params: {
  request: Request;
  name: string;
  args: Record<string, unknown>;
}): Promise<McpToolResult> {
  const { request, name, args } = params;
  const origin = originFromRequest(request);

  if (name === "arcdot_catalog") {
    const services = await listPublishedServices();
    const profiles = await getProfilesByAddresses(
      services.map((s) => s.owner_address),
    );
    const payload = {
      protocol: "arcdot.gateway",
      chainId: ARC.chainId,
      gateway: ARC.gatewayAddress || null,
      mcp: `${origin}/api/mcp`,
      note: "price_wei is 18-decimal native USDC. 0.01 = 1e16.",
      services: services.map((s) => ({
        tool: toolNameForSlug(s.slug),
        slug: s.slug,
        title: s.title,
        description: s.description,
        price_usdc: s.price_usdc,
        price_wei: s.price_wei,
        seller: s.owner_address,
        seller_name:
          profiles.get(s.owner_address.toLowerCase())?.display_name ?? null,
        has_upstream: Boolean(s.upstream_url?.trim()),
      })),
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
    };
    return textResult(JSON.stringify(payload, null, 2));
  }

  const slug = slugFromToolName(name);
  if (!slug) {
    return textResult(`Unknown tool: ${name}`, { isError: true });
  }

  const service = await getServiceBySlug(slug);
  if (!service || service.status !== "published" || service.paused) {
    return textResult(`Service not available: ${slug}`, { isError: true });
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

  const input = { prompt: prompt.trim() };
  const demoSecret = request.headers.get("x-arc-demo-secret");
  const paymentRaw =
    args.payment && typeof args.payment === "object"
      ? (args.payment as Record<string, unknown>)
      : null;

  // 1) Demo unlock via MCP request header
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
        meta: { settlement: result.body.settlement, demo: true },
      });
    }
    return textResult(JSON.stringify(result.body, null, 2), {
      isError: true,
      meta: { status: result.status },
    });
  }

  // 2) Explicit payment proof in tool args
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
        meta: { settlement: result.body.settlement },
      });
    }
    return textResult(JSON.stringify(result.body, null, 2), {
      isError: true,
      meta: { status: result.status },
    });
  }

  // 3) Optional server-side auto-pay (AGENT_PRIVATE_KEY + MCP_AUTO_PAY=true)
  if (
    process.env.MCP_AUTO_PAY === "true" &&
    process.env.AGENT_PRIVATE_KEY
  ) {
    try {
      const paid = await runPaidAgentRequest({
        baseUrl: origin,
        service: slug,
        input,
        privateKey: agentPrivateKeyFromEnv(),
        clientRequestId: `mcp-autopay-${Date.now()}`,
      });
      if (paid.gateway.ok) {
        const text =
          typeof paid.gateway.body.result === "object" &&
          paid.gateway.body.result &&
          "text" in paid.gateway.body.result
            ? String((paid.gateway.body.result as { text: unknown }).text)
            : JSON.stringify(paid.gateway.body.result);
        return textResult(text, {
          meta: {
            txHash: paid.txHash,
            paymentId: paid.paymentId,
            settlement: paid.gateway.body.settlement,
            autoPay: true,
          },
        });
      }
      return textResult(JSON.stringify(paid.gateway.body, null, 2), {
        isError: true,
      });
    } catch (err) {
      return textResult(
        err instanceof Error ? err.message : "Auto-pay failed",
        { isError: true },
      );
    }
  }

  // 4) Unpaid → machine-readable pay instructions (402 equivalent)
  const payment = buildPaymentInstructions(service);
  const unpaid = {
    ok: false,
    status: 402,
    error: {
      code: "PAYMENT_REQUIRED",
      message:
        "Pay depositPayment(paymentId, seller) with msg.value == price_wei on Arc (chain 5042), then retry tools/call with arguments.payment { txHash, address, signature }.",
      payment,
      service: {
        slug: service.slug,
        tool: toolNameForSlug(service.slug),
        price_usdc: service.price_usdc,
        price_wei: service.price_wei,
        seller: service.owner_address,
      },
    },
  };
  return textResult(JSON.stringify(unpaid, null, 2), {
    isError: true,
    meta: { paymentRequired: true, payment },
  });
}
