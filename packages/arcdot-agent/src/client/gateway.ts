import { type Hex } from "viem";
import type { PaymentProof } from "../constants.js";
import { GATEWAY_FEE_WEI_DEFAULT } from "../constants.js";
import {
  parsePaymentRequired,
  paymentDepositArgs,
} from "./paymentParse.js";
import { InsufficientFundsError, settlePayment } from "../settle/pay.js";
import { formatFundsNeededMessage } from "../wallet/fundsNeeded.js";
import { resolvePrivateKey } from "../wallet/store.js";

export type GatewayCallResult =
  | { ok: true; status: 200; body: Record<string, unknown> }
  | { ok: false; status: number; body: unknown };

export type CatalogService = {
  slug: string;
  price_wei: string;
  seller: `0x${string}`;
  title?: string;
};

export async function fetchService(
  origin: string,
  slug: string,
): Promise<CatalogService> {
  const res = await fetch(new URL(`/api/services/${slug}`, origin));
  const json = (await res.json()) as {
    service?: {
      slug: string;
      price_wei: string;
      seller?: string;
      owner_address?: string;
      title?: string;
    };
    error?: string;
  };
  if (!res.ok || !json.service) {
    throw new Error(json.error || `Service not found: ${slug}`);
  }
  const sellerRaw = json.service.seller || json.service.owner_address;
  if (!sellerRaw || !/^0x[a-fA-F0-9]{40}$/.test(sellerRaw)) {
    throw new Error("Service is missing a valid seller address");
  }
  return {
    slug: json.service.slug,
    price_wei: json.service.price_wei,
    seller: sellerRaw as `0x${string}`,
    title: json.service.title,
  };
}

export async function resolveGateway(
  origin: string,
  override?: `0x${string}`,
): Promise<`0x${string}`> {
  if (override && override.length === 42) return override;
  if (process.env.ARCDOT_GATEWAY?.startsWith("0x")) {
    return process.env.ARCDOT_GATEWAY as `0x${string}`;
  }
  const res = await fetch(new URL("/api/services", origin));
  const json = (await res.json()) as { gateway?: string | null };
  if (json.gateway && json.gateway.length === 42) {
    return json.gateway as `0x${string}`;
  }
  throw new Error(
    "Gateway address not configured on host. Set ARCDOT_GATEWAY or deploy PromptGateway.",
  );
}

async function postGatewayPaid(params: {
  origin: string;
  service: string;
  input: unknown;
  proof: PaymentProof;
  feeWei: bigint;
  clientRequestId?: string;
}): Promise<GatewayCallResult> {
  const body = {
    service: params.service,
    input: params.input,
    clientRequestId: params.clientRequestId,
    auth: {
      issuedAt: params.proof.issuedAt,
      expiresAt: params.proof.expiresAt,
    },
  };
  const res = await fetch(new URL("/api/gateway", params.origin), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Arc-Tx-Hash": params.proof.txHash,
      "X-Arc-Address": params.proof.address,
      "X-Arc-Signature": params.proof.signature,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (res.status === 200 && json?.ok === true) {
    return { ok: true, status: 200, body: json as Record<string, unknown> };
  }
  return { ok: false, status: res.status, body: json };
}

/**
 * Unlock a catalog service with auto-settle:
 * try unpaid → on 402 deposit + sign → retry paid.
 */
export async function unlockWithAutoSettle(params: {
  origin: string;
  service: string;
  input: unknown;
  privateKey?: Hex;
  gateway?: `0x${string}`;
  rpcUrl?: string;
  clientRequestId?: string;
}): Promise<{
  gateway: GatewayCallResult;
  txHash?: Hex;
  paymentId?: Hex;
  settled: boolean;
}> {
  const privateKey = params.privateKey ?? resolvePrivateKey();
  const origin = params.origin.replace(/\/$/, "");

  // Probe unpaid to get payment instructions (or succeed if free — gateway always paid for catalog tools)
  const probe = await fetch(new URL("/api/gateway", origin), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service: params.service,
      input: params.input,
      clientRequestId: params.clientRequestId,
    }),
  });
  const probeJson = await probe.json();

  if (probe.status === 200 && probeJson?.ok === true) {
    return {
      gateway: { ok: true, status: 200, body: probeJson },
      settled: false,
    };
  }

  const payment = parsePaymentRequired(probeJson);
  const service = await fetchService(origin, params.service);
  const gatewayAddr =
    params.gateway ||
    (payment ? payment.gateway : await resolveGateway(origin));

  let feeWei = BigInt(service.price_wei);
  let seller = service.seller;
  let chainId: number | undefined;
  let rpcUrl = params.rpcUrl;
  if (payment) {
    const args = paymentDepositArgs(payment);
    feeWei = args.feeWei;
    seller = args.seller;
    chainId = args.chainId;
    rpcUrl = params.rpcUrl || args.rpcUrl;
  }
  if (feeWei <= 0n) feeWei = GATEWAY_FEE_WEI_DEFAULT;

  let settled;
  try {
    settled = await settlePayment({
      privateKey,
      gateway: gatewayAddr,
      seller,
      service: params.service,
      feeWei,
      input: params.input,
      rpcUrl,
      chainId,
    });
  } catch (err) {
    if (err instanceof InsufficientFundsError) {
      const { text, payload } = formatFundsNeededMessage({
        status: err.status,
        requiredWei: err.requiredWei,
        origin,
        serviceSlug: params.service,
      });
      return {
        gateway: {
          ok: false,
          status: 402,
          body: {
            ...payload,
            message: text,
          },
        },
        settled: false,
      };
    }
    throw err;
  }

  const gateway = await postGatewayPaid({
    origin,
    service: params.service,
    input: params.input,
    proof: settled.proof,
    feeWei: settled.feeWei,
    clientRequestId: params.clientRequestId,
  });

  return {
    gateway,
    txHash: settled.proof.txHash,
    paymentId: settled.paymentId,
    settled: true,
  };
}
