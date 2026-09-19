/**
 * Parse HTTP 402 / payment-required gateway bodies for agent clients.
 * Machine JSON only — not for UI copy.
 */

import type {
  Gateway402Body,
  GatewayErrorCode,
  GatewayPaymentInstructions,
} from "@/lib/types/gateway";

export function isGateway402Body(value: unknown): value is Gateway402Body {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.ok !== false || v.status !== 402) return false;
  const err = v.error;
  if (!err || typeof err !== "object") return false;
  const payment = (err as { payment?: unknown }).payment;
  return Boolean(payment && typeof payment === "object");
}

export function parsePaymentRequired(
  body: unknown,
): GatewayPaymentInstructions | null {
  if (!isGateway402Body(body)) return null;
  return body.error.payment;
}

export function gatewayErrorCode(body: unknown): GatewayErrorCode | null {
  if (!body || typeof body !== "object") return null;
  const err = (body as { error?: { code?: unknown } }).error;
  if (!err || typeof err.code !== "string") return null;
  return err.code as GatewayErrorCode;
}

/** Extract feeWei + seller from a 402 body for depositPayment. */
export function paymentDepositArgs(body: unknown): {
  feeWei: bigint;
  seller: `0x${string}` | null;
  gateway: `0x${string}`;
  chainId: number;
} | null {
  const payment = parsePaymentRequired(body);
  if (!payment) return null;
  return {
    feeWei: BigInt(payment.feeWei),
    seller: payment.seller,
    gateway: payment.gateway,
    chainId: payment.chainId,
  };
}
