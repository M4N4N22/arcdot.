/** Machine-readable catalog helpers for agent discovery. Not UI copy. */

import { ARC } from "@/lib/arc/constants";
import { ARC_CHAIN_ID } from "@/lib/types/gateway";
import type { ServiceRow } from "@/lib/types/catalog";

const INPUT_HINT = {
  type: "object",
  required: ["prompt"],
  properties: {
    prompt: { type: "string", description: "Natural-language request for the service" },
  },
} as const;

export function publicServiceForAgent(
  s: ServiceRow,
  sellerName?: string | null,
) {
  return {
    slug: s.slug,
    title: s.title,
    description: s.description,
    price_usdc: s.price_usdc,
    price_wei: s.price_wei,
    seller: s.owner_address,
    seller_name: sellerName ?? null,
    paused: s.paused,
    input: INPUT_HINT,
    example: {
      service: s.slug,
      input: { prompt: "Briefly explain what this service should do." },
    },
  };
}

export type SellerNameMap = Record<string, string | null>;

/** Envelope agents should read first from GET /api/services */
export function agentCatalogEnvelope(
  services: ServiceRow[],
  sellerNames: SellerNameMap = {},
) {
  const gateway =
    ARC.gatewayAddress && ARC.gatewayAddress.length === 42
      ? ARC.gatewayAddress
      : null;

  const sampleSlug = services[0]?.slug ?? "quick-brief";

  return {
    protocol: "arcdot.gateway",
    version: 2,
    chainId: ARC_CHAIN_ID,
    docs: "/docs",
    currency: {
      symbol: "USDC",
      decimals: 18,
      note: "Arc native USDC — use price_wei as msg.value (not ERC-20 6-decimal units)",
    },
    gateway,
    endpoints: {
      catalog: "/api/services",
      service: "/api/services/{slug}",
      unlock: "/api/gateway",
      health: "/api/health",
      wellKnownPlugin: "/.well-known/ai-plugin.json",
      wellKnownAgent: "/.well-known/arcdot.json",
      openapi: "/.well-known/openapi.json",
    },
    payment: {
      method: "depositPayment",
      args: ["paymentId:bytes32", "seller:address"],
      auth: "EIP-191 personal_sign over gateway challenge",
      headers: ["X-Arc-Tx-Hash", "X-Arc-Address", "X-Arc-Signature"],
      unpaidStatus: 402,
      x402: {
        version: 2,
        header: "PAYMENT-REQUIRED",
        settlement: "ArcDotPromptGateway",
      },
    },
    examples: {
      curl: `curl -s "$BASE/api/services" && npm run agent:pay -- ${sampleSlug} "Your prompt"`,
    },
    rpcUrl: ARC.rpcUrl,
    explorerTxBase: ARC.explorerTxBase,
    services: services.map((s) =>
      publicServiceForAgent(
        s,
        sellerNames[s.owner_address.toLowerCase()] ?? null,
      ),
    ),
  };
}
