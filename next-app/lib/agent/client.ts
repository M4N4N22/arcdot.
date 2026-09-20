import type { Hex } from "viem";
import { hashGatewayInput } from "@/lib/auth/inputHash";
import { buildAuthChallenge } from "@/lib/auth/verifySignature";
import type {
  Gateway200Body,
  Gateway402Body,
  GatewayAuthMessage,
} from "@/lib/types/gateway";
import { GATEWAY_FEE_WEI_DEFAULT } from "@/lib/types/gateway";
import { getArcChainId } from "@/lib/arc/network";

export type GatewayCallResult =
  | { ok: true; status: 200; body: Gateway200Body }
  | { ok: false; status: number; body: Gateway402Body | unknown };

export interface CallGatewayPaidParams {
  baseUrl: string;
  service: string;
  input: unknown;
  gateway: `0x${string}`;
  feeWei?: bigint;
  txHash: Hex;
  address: `0x${string}`;
  /** EIP-191 signature over buildAuthChallenge(...) */
  signature: Hex;
  issuedAt?: number;
  expiresAt?: number;
  clientRequestId?: string;
}

export interface CallGatewayDemoParams {
  baseUrl: string;
  service: string;
  input: unknown;
  demoSecret: string;
  clientRequestId?: string;
}

export function buildGatewayAuthMessage(params: {
  gateway: `0x${string}`;
  txHash: Hex;
  feeWei: bigint;
  service: string;
  input: unknown;
  issuedAt: number;
  expiresAt: number;
}): GatewayAuthMessage {
  return {
    domain: "arcdot.gateway",
    chainId: getArcChainId(),
    gateway: params.gateway,
    txHash: params.txHash,
    feeWei: params.feeWei.toString(),
    service: params.service,
    inputHash: hashGatewayInput(params.input),
    issuedAt: params.issuedAt,
    expiresAt: params.expiresAt,
  };
}

export function getAuthChallengeText(
  message: GatewayAuthMessage,
): string {
  return buildAuthChallenge(message);
}

/** Paid path — requires Arc tx + EIP-191 signature headers. */
export async function callGatewayPaid(
  params: CallGatewayPaidParams,
): Promise<GatewayCallResult> {
  const now = Math.floor(Date.now() / 1000);
  const issuedAt = params.issuedAt ?? now;
  const expiresAt = params.expiresAt ?? now + 120;
  const feeWei = params.feeWei ?? GATEWAY_FEE_WEI_DEFAULT;

  const body = {
    service: params.service,
    input: params.input,
    clientRequestId: params.clientRequestId,
    auth: { issuedAt, expiresAt },
  };

  const res = await fetch(new URL("/api/gateway", params.baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Arc-Tx-Hash": params.txHash,
      "X-Arc-Address": params.address,
      "X-Arc-Signature": params.signature,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (res.status === 200 && json?.ok === true) {
    return { ok: true, status: 200, body: json as Gateway200Body };
  }
  return { ok: false, status: res.status, body: json };
}

/** Demo unlock path — requires DEMO_AGENT_SECRET on the server. */
export async function callGatewayDemo(
  params: CallGatewayDemoParams,
): Promise<GatewayCallResult> {
  const now = Math.floor(Date.now() / 1000);
  const body = {
    service: params.service,
    input: params.input,
    clientRequestId: params.clientRequestId,
    auth: { issuedAt: now, expiresAt: now + 120 },
  };

  const res = await fetch(new URL("/api/gateway", params.baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Arc-Demo-Secret": params.demoSecret,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (res.status === 200 && json?.ok === true) {
    return { ok: true, status: 200, body: json as Gateway200Body };
  }
  return { ok: false, status: res.status, body: json };
}
