/** Machine-readable discovery documents for agents / crawlers. */

import { ARC } from "@/lib/arc/constants";
import { ARC_CHAIN_ID } from "@/lib/types/gateway";
import type { ServiceRow } from "@/lib/types/catalog";
import { publicServiceForAgent, type SellerNameMap } from "@/lib/agent/catalog";

function originFromRequest(request: Request): string {
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "localhost:3000";
  return `${proto}://${host}`;
}

export function buildAiPluginManifest(request: Request) {
  const origin = originFromRequest(request);
  return {
    schema_version: "v1",
    name_for_human: "arcdot.",
    name_for_model: "arcdot_payable_gateway",
    description_for_human:
      "Pay-as-you-go API gateway on Arc. Agents discover gated services, pay native USDC, and unlock replies.",
    description_for_model:
      "Use arcdot to discover payable API services on Arc Mainnet (chainId 5042), pay exact native USDC (18 decimals) via PromptGateway.depositPayment, then unlock with POST /api/gateway and X-Arc-Tx-Hash, X-Arc-Address, X-Arc-Signature (EIP-191). Catalog: GET /api/services. Unpaid calls return HTTP 402 with PAYMENT-REQUIRED (x402 v2) and JSON error.payment. Never treat amounts as 6-decimal ERC-20 units.",
    auth: { type: "none" },
    api: {
      type: "openapi",
      url: `${origin}/.well-known/openapi.json`,
    },
    logo_url: `${origin}/favicon.ico`,
    contact_email: "builders@arcdot.local",
    legal_info_url: `${origin}/docs`,
  };
}

export function buildAgentManifest(
  request: Request,
  services: ServiceRow[],
  sellerNames: SellerNameMap = {},
) {
  const origin = originFromRequest(request);
  const gateway =
    ARC.gatewayAddress && ARC.gatewayAddress.length === 42
      ? ARC.gatewayAddress
      : null;

  return {
    protocol: "arcdot.gateway",
    version: 2,
    x402: {
      version: 2,
      negotiation: "PAYMENT-REQUIRED header (base64 JSON) + JSON body error.payment",
      settlement: "ArcDotPromptGateway on-chain depositPayment (not GatewayWalletBatched)",
    },
    service_name: "arcdot.",
    endpoint: origin,
    pricing_model: "x402-nanopayment",
    currency: "USDC",
    currency_decimals: 18,
    network: "Arc-Mainnet",
    caip2: `eip155:${ARC_CHAIN_ID}`,
    escrow_contract: gateway,
    catalog: `${origin}/api/services`,
    unlock: `${origin}/api/gateway`,
    mcp: `${origin}/api/mcp`,
    docs: `${origin}/docs`,
    openapi: `${origin}/.well-known/openapi.json`,
    note: "amount / price_wei use 18-decimal native USDC. 0.01 USDC = 10000000000000000 (1e16). MCP: POST /api/mcp (tools/list, tools/call).",
    services: services.map((s) => {
      const pub = publicServiceForAgent(
        s,
        sellerNames[s.owner_address.toLowerCase()] ?? null,
      );
      return {
        service_name: pub.title,
        slug: pub.slug,
        description: pub.description,
        endpoint: `${origin}/api/gateway`,
        pricing_model: "x402-nanopayment",
        currency: "USDC",
        amount_units: pub.price_wei,
        amount_usdc: pub.price_usdc,
        currency_decimals: 18,
        network: "Arc-Mainnet",
        caip2: `eip155:${ARC_CHAIN_ID}`,
        escrow_contract: gateway,
        seller: pub.seller,
        seller_name: pub.seller_name,
      };
    }),
  };
}

export function buildOpenApiDocument(request: Request) {
  const origin = originFromRequest(request);
  return {
    openapi: "3.1.0",
    info: {
      title: "arcdot. gateway",
      version: "2.0.0",
      description:
        "Payable API gateway on Arc Mainnet. Discover services, settle native USDC (18 decimals), unlock via /api/gateway.",
    },
    servers: [{ url: origin }],
    paths: {
      "/api/services": {
        get: {
          summary: "Machine-readable service catalog",
          operationId: "listServices",
          responses: {
            "200": {
              description: "Catalog envelope with services and payment metadata",
            },
          },
        },
      },
      "/api/services/{slug}": {
        get: {
          summary: "Single service",
          operationId: "getService",
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { "200": { description: "Service + protocol envelope" } },
        },
      },
      "/api/gateway": {
        post: {
          summary: "Unlock a gated service after Arc payment",
          operationId: "unlockGateway",
          parameters: [
            {
              name: "X-Arc-Tx-Hash",
              in: "header",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "X-Arc-Address",
              in: "header",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "X-Arc-Signature",
              in: "header",
              required: true,
              schema: { type: "string" },
              description: "EIP-191 personal_sign over gateway challenge",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["service", "input", "auth"],
                  properties: {
                    service: { type: "string" },
                    input: {
                      type: "object",
                      properties: { prompt: { type: "string" } },
                    },
                    auth: {
                      type: "object",
                      properties: {
                        issuedAt: { type: "integer" },
                        expiresAt: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Settlement + result" },
            "402": {
              description:
                "Payment required — body error.payment + PAYMENT-REQUIRED header (x402 v2)",
            },
          },
        },
      },
      "/api/health": {
        get: {
          summary: "Health check",
          operationId: "health",
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/mcp": {
        get: {
          summary: "MCP server descriptor (Streamable HTTP)",
          operationId: "mcpDescribe",
          responses: { "200": { description: "MCP endpoint metadata" } },
        },
        post: {
          summary: "MCP JSON-RPC (initialize, tools/list, tools/call)",
          operationId: "mcpRpc",
          description:
            "Catalog services as MCP tools. Unpaid tools/call returns payment instructions in tool content.",
          responses: {
            "200": { description: "JSON-RPC response" },
            "204": { description: "Notification acknowledged" },
          },
        },
      },
    },
  };
}
