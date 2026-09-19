/**
 * x402-compatible negotiation shim for arcdot.
 * Advertises Arc-native depositPayment settlement (18-decimal USDC).
 * Does not implement Circle GatewayWalletBatched / EIP-3009 — agents use
 * on-chain deposit + X-Arc-* headers (see extra.unlockHeaders).
 */

import { ARC } from "@/lib/arc/constants";
import { ARC_CHAIN_ID, GATEWAY_FEE_USDC } from "@/lib/types/gateway";
import type { GatewayPaymentInstructions } from "@/lib/types/gateway";
import type { ServiceRow } from "@/lib/types/catalog";

const ZERO_ADDR =
  "0x0000000000000000000000000000000000000000" as const;

export type X402Accept = {
  scheme: "exact";
  network: `eip155:${typeof ARC_CHAIN_ID}`;
  asset: "USDC-native";
  amount: string;
  payTo: `0x${string}`;
  maxTimeoutSeconds: number;
  extra: {
    name: "ArcDotPromptGateway";
    method: "depositPayment";
    seller: `0x${string}` | null;
    currencyDecimals: 18;
    feeUsdc: string;
    unlockPath: "/api/gateway";
    unlockHeaders: string[];
    auth: "EIP-191";
    paymentIdRequired: true;
    note: string;
  };
};

export type X402PaymentRequired = {
  x402Version: 2;
  resource: {
    url: string;
    description: string;
    mimeType: "application/json";
  };
  accepts: X402Accept[];
  error?: {
    code: string;
    message: string;
  };
};

export function buildPaymentInstructions(
  service?: ServiceRow | null,
): GatewayPaymentInstructions {
  const seller =
    service?.owner_address && /^0x[a-fA-F0-9]{40}$/.test(service.owner_address)
      ? (service.owner_address as `0x${string}`)
      : null;
  return {
    chainId: ARC.chainId,
    gateway: ARC.gatewayAddress || ZERO_ADDR,
    seller,
    feeWei: service?.price_wei ?? ARC.feeWei.toString(),
    feeUsdc: service?.price_usdc ?? GATEWAY_FEE_USDC,
    method: "depositPayment",
    paymentIdHint:
      "Unique bytes32 per deposit; call depositPayment(paymentId, seller) with msg.value == feeWei",
    rpcUrl: ARC.rpcUrl,
    explorerTxBase: ARC.explorerTxBase,
    unlockPath: "/api/gateway",
    auth: "EIP-191",
  };
}

export function buildX402PaymentRequired(params: {
  payment: GatewayPaymentInstructions;
  service?: ServiceRow | null;
  code?: string;
  message?: string;
  requestUrl?: string;
}): X402PaymentRequired {
  const { payment, service } = params;
  const slug = service?.slug;
  return {
    x402Version: 2,
    resource: {
      url: payment.unlockPath,
      description: slug
        ? `Unlock gated service "${slug}" on arcdot.`
        : "Unlock a gated arcdot. service after Arc native USDC settlement.",
      mimeType: "application/json",
    },
    accepts: [
      {
        scheme: "exact",
        network: `eip155:${ARC_CHAIN_ID}`,
        asset: "USDC-native",
        amount: payment.feeWei,
        payTo: payment.gateway,
        maxTimeoutSeconds: 120,
        extra: {
          name: "ArcDotPromptGateway",
          method: "depositPayment",
          seller: payment.seller,
          currencyDecimals: 18,
          feeUsdc: payment.feeUsdc,
          unlockPath: "/api/gateway",
          unlockHeaders: [
            "X-Arc-Tx-Hash",
            "X-Arc-Address",
            "X-Arc-Signature",
          ],
          auth: "EIP-191",
          paymentIdRequired: true,
          note: "Arc Mainnet native USDC is 18 decimals. amount is feeWei (e.g. 0.01 USDC = 1e16). Do not use 6-decimal ERC-20 units.",
        },
      },
    ],
    error:
      params.code || params.message
        ? {
            code: params.code ?? "PAYMENT_REQUIRED",
            message: params.message ?? "Payment required",
          }
        : undefined,
  };
}

export function encodePaymentRequiredHeader(
  body: X402PaymentRequired,
): string {
  return Buffer.from(JSON.stringify(body), "utf8").toString("base64");
}

/** Attach x402 + discoverability headers to a 402 NextResponse. */
export function withX402Headers(
  headers: Headers,
  payment: GatewayPaymentInstructions,
  x402: X402PaymentRequired,
): void {
  headers.set("PAYMENT-REQUIRED", encodePaymentRequiredHeader(x402));
  headers.set("X-Payment-Protocol", "x402");
  headers.set("X-Payment-Network", `eip155:${ARC_CHAIN_ID}`);
  headers.set("X-Payment-Currency", "USDC");
  headers.set("X-Payment-Decimals", "18");
  headers.set("X-Payment-Amount", payment.feeWei);
  headers.set("X-Payment-Wallet", payment.gateway);
  if (payment.seller) {
    headers.set("X-Payment-Seller", payment.seller);
  }
  headers.set("X-Payment-Method", "depositPayment");
  headers.set(
    "Access-Control-Expose-Headers",
    [
      "PAYMENT-REQUIRED",
      "X-Payment-Protocol",
      "X-Payment-Network",
      "X-Payment-Currency",
      "X-Payment-Decimals",
      "X-Payment-Amount",
      "X-Payment-Wallet",
      "X-Payment-Seller",
      "X-Payment-Method",
    ].join(", "),
  );
}
