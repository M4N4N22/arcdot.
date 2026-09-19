import { NextResponse } from "next/server";
import type { Hex } from "viem";
import {
  buildPaymentInstructions,
  buildX402PaymentRequired,
  withX402Headers,
} from "@/lib/agent/x402";
import { ARC } from "@/lib/arc/constants";
import {
  PaymentVerificationError,
  verifyArcPayment,
} from "@/lib/arc/verifyPayment";
import { hashGatewayInput } from "@/lib/auth/inputHash";
import { verifyGatewaySignature } from "@/lib/auth/verifySignature";
import {
  getServiceBySlug,
  insertRequest,
  tryMarkSpentPayment,
} from "@/lib/catalog/store";
import { checkRateLimit, clientIp } from "@/lib/gateway/rateLimit";
import {
  gatewayBodySchema,
  gatewayHeadersSchema,
} from "@/lib/gateway/schema";
import { completeWithGemini } from "@/lib/llm/gemini";
import type {
  Gateway200Body,
  Gateway402Body,
  GatewayAuthMessage,
  GatewayErrorCode,
  GatewaySettlement,
} from "@/lib/types/gateway";
import { GATEWAY_FEE_USDC } from "@/lib/types/gateway";
import type { ServiceRow } from "@/lib/types/catalog";

export const runtime = "nodejs";

const ZERO_ADDR =
  "0x0000000000000000000000000000000000000000" as const;
const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

function demoUnlockAllowed(): boolean {
  if (process.env.ALLOW_DEMO_UNLOCK === "true") return true;
  if (process.env.NODE_ENV === "production") return false;
  return Boolean(process.env.DEMO_AGENT_SECRET);
}

function isDemoUnlock(request: Request): boolean {
  if (!demoUnlockAllowed()) return false;
  const secret = process.env.DEMO_AGENT_SECRET;
  if (!secret) return false;
  const provided = request.headers.get("x-arc-demo-secret");
  return Boolean(provided && provided === secret);
}

function paymentRequired(
  code: GatewayErrorCode,
  message: string,
  requestId: string,
  service?: ServiceRow | null,
): NextResponse<Gateway402Body> {
  const payment = buildPaymentInstructions(service);
  const x402 = buildX402PaymentRequired({
    payment,
    service,
    code,
    message,
  });
  const res = NextResponse.json(
    {
      ok: false as const,
      status: 402 as const,
      error: {
        code,
        message,
        payment,
      },
      x402,
      requestId,
      timestamp: new Date().toISOString(),
    } satisfies Gateway402Body,
    { status: 402 },
  );
  withX402Headers(res.headers, payment, x402);
  return res;
}

function extractPrompt(input: unknown): string {
  if (typeof input === "string") return input;
  if (input && typeof input === "object" && "prompt" in input) {
    const p = (input as { prompt: unknown }).prompt;
    if (typeof p === "string") return p;
  }
  return JSON.stringify(input ?? "");
}

function splitAmounts(amountWei: bigint): {
  sellerAmountWei: bigint;
  platformAmountWei: bigint;
} {
  const platformAmountWei =
    (amountWei * BigInt(ARC.platformFeeBps)) / BigInt(10_000);
  return {
    platformAmountWei,
    sellerAmountWei: amountWei - platformAmountWei,
  };
}

function logGateway(event: Record<string, unknown>) {
  console.log(JSON.stringify({ scope: "arcdot.gateway", ...event }));
}

async function fulfillUpstream(params: {
  serviceRow: ServiceRow | null;
  serviceKey: string;
  input: unknown;
  requestId: string;
  started: number;
  settlement: GatewaySettlement;
  demo: boolean;
  payer: string;
  seller?: string;
  amountWei?: string;
  sellerAmountWei?: string;
  platformAmountWei?: string;
}): Promise<NextResponse> {
  const prompt = extractPrompt(params.input);
  try {
    const { text, mock } = await completeWithGemini(
      prompt,
      params.serviceRow?.system_prompt,
    );

    if (params.serviceRow) {
      await insertRequest({
        service_id: params.serviceRow.id,
        service_slug: params.serviceRow.slug,
        payer_address: params.payer,
        seller_address:
          params.seller ?? params.serviceRow.owner_address,
        tx_hash: params.settlement.txHash,
        payment_id: params.settlement.paymentId,
        status: "fulfilled",
        prompt,
        response_preview: text.slice(0, 500),
        amount_wei: params.amountWei ?? params.settlement.amountWei,
        seller_amount_wei: params.sellerAmountWei ?? null,
        platform_amount_wei: params.platformAmountWei ?? null,
      }).catch((err) => console.error("insertRequest failed", err));
    }

    logGateway({
      outcome: "ok",
      requestId: params.requestId,
      service: params.serviceKey,
      payer: params.payer,
      demo: params.demo,
      mock,
      latencyMs: Date.now() - params.started,
    });

    const response: Gateway200Body = {
      ok: true,
      status: 200,
      settlement: {
        ...params.settlement,
        amountUsdc:
          params.serviceRow?.price_usdc ?? params.settlement.amountUsdc,
      },
      result: { text, service: params.serviceKey },
      meta: {
        requestId: params.requestId,
        service: params.serviceKey,
        latencyMs: Date.now() - params.started,
        mock,
        demo: params.demo,
      },
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error(err);
    if (params.serviceRow) {
      await insertRequest({
        service_id: params.serviceRow.id,
        service_slug: params.serviceRow.slug,
        payer_address: params.payer,
        seller_address:
          params.seller ?? params.serviceRow.owner_address,
        tx_hash: params.settlement.txHash,
        payment_id: params.settlement.paymentId,
        status: "failed",
        prompt,
        response_preview: null,
        amount_wei: params.amountWei ?? params.settlement.amountWei,
        seller_amount_wei: params.sellerAmountWei ?? null,
        platform_amount_wei: params.platformAmountWei ?? null,
      }).catch(() => undefined);
    }
    logGateway({
      outcome: "upstream_failed",
      requestId: params.requestId,
      service: params.serviceKey,
      latencyMs: Date.now() - params.started,
    });
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        error: {
          code: "UPSTREAM_FAILED" as GatewayErrorCode,
          message:
            "Paid request could not be completed. Contact support with requestId.",
        },
        requestId: params.requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const started = Date.now();

  const rl = checkRateLimit({ key: `gw:${clientIp(request)}` });
  if (!rl.ok) {
    logGateway({ outcome: "rate_limited", requestId });
    return NextResponse.json(
      {
        ok: false,
        status: 429,
        error: {
          code: "RATE_LIMITED" as GatewayErrorCode,
          message: "Too many requests. Please wait and try again.",
        },
        requestId,
        timestamp: new Date().toISOString(),
      },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      },
    );
  }

  const demo = isDemoUnlock(request);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return paymentRequired(
      "PAYLOAD_INVALID",
      "Request body must be JSON",
      requestId,
    );
  }

  const body = gatewayBodySchema.safeParse(json);
  if (!body.success) {
    return paymentRequired(
      "PAYLOAD_INVALID",
      "Request payload is invalid",
      requestId,
    );
  }

  const serviceRow = await getServiceBySlug(body.data.service).catch(() => null);

  if (demo) {
    const amount = serviceRow?.price_wei ?? ARC.feeWei.toString();
    const split = splitAmounts(BigInt(amount));
    return fulfillUpstream({
      serviceRow,
      serviceKey: body.data.service,
      input: body.data.input,
      requestId,
      started,
      settlement: {
        txHash: ZERO_HASH,
        payer: ZERO_ADDR,
        amountWei: amount,
        amountUsdc: serviceRow?.price_usdc ?? GATEWAY_FEE_USDC,
        paymentId: ZERO_HASH,
        blockNumber: 0,
        verifiedAt: new Date().toISOString(),
      },
      demo: true,
      payer: "demo",
      seller: serviceRow?.owner_address,
      amountWei: amount,
      sellerAmountWei: split.sellerAmountWei.toString(),
      platformAmountWei: split.platformAmountWei.toString(),
    });
  }

  if (!serviceRow || serviceRow.status !== "published") {
    return paymentRequired(
      "SERVICE_NOT_FOUND",
      "This service is not available",
      requestId,
    );
  }

  if (serviceRow.paused) {
    return paymentRequired(
      "SERVICE_PAUSED",
      "This service is temporarily unavailable",
      requestId,
      serviceRow,
    );
  }

  const headers = gatewayHeadersSchema.safeParse({
    txHash: request.headers.get("x-arc-tx-hash") ?? "",
    address: request.headers.get("x-arc-address") ?? "",
    signature: request.headers.get("x-arc-signature") ?? "",
  });

  if (!headers.success) {
    return paymentRequired(
      "MISSING_HEADERS",
      "Payment confirmation headers are incomplete",
      requestId,
      serviceRow,
    );
  }

  if (!ARC.gatewayAddress) {
    return paymentRequired(
      "GATEWAY_NOT_CONFIGURED",
      "Gateway is not configured on the server",
      requestId,
      serviceRow,
    );
  }

  const txHash = headers.data.txHash as Hex;
  const address = headers.data.address as `0x${string}`;
  const signature = headers.data.signature as Hex;
  const expectedAmount = BigInt(serviceRow.price_wei);
  const inputHash = hashGatewayInput(body.data.input);

  const authMessage: GatewayAuthMessage = {
    domain: "arcdot.gateway",
    chainId: ARC.chainId,
    gateway: ARC.gatewayAddress,
    txHash,
    feeWei: serviceRow.price_wei,
    service: body.data.service,
    inputHash,
    issuedAt: body.data.auth.issuedAt,
    expiresAt: body.data.auth.expiresAt,
  };

  const sigOk = await verifyGatewaySignature({
    message: authMessage,
    signature,
    expectedAddress: address,
  });

  if (!sigOk) {
    return paymentRequired(
      "INVALID_SIGNATURE",
      "Signature does not match the paying wallet",
      requestId,
      serviceRow,
    );
  }

  let verified;
  try {
    verified = await verifyArcPayment({
      txHash,
      expectedPayer: address,
      expectedSeller: serviceRow.owner_address as `0x${string}`,
      expectedAmount,
    });
  } catch (err) {
    if (err instanceof PaymentVerificationError) {
      return paymentRequired(
        err.code as GatewayErrorCode,
        err.message,
        requestId,
        serviceRow,
      );
    }
    console.error(err);
    return paymentRequired(
      "TX_NOT_FOUND",
      "Could not verify payment on Arc",
      requestId,
      serviceRow,
    );
  }

  const marked = await tryMarkSpentPayment({
    txHash,
    paymentId: verified.paymentId,
    payerAddress: address,
    serviceId: serviceRow.id,
  });
  if (!marked) {
    return paymentRequired(
      "TX_ALREADY_CONSUMED",
      "This payment was already used",
      requestId,
      serviceRow,
    );
  }

  return fulfillUpstream({
    serviceRow,
    serviceKey: body.data.service,
    input: body.data.input,
    requestId,
    started,
    settlement: {
      txHash: verified.txHash,
      payer: verified.payer,
      amountWei: verified.amountWei.toString(),
      amountUsdc: serviceRow.price_usdc,
      paymentId: verified.paymentId,
      blockNumber: Number(verified.blockNumber),
      verifiedAt: new Date().toISOString(),
    },
    demo: false,
    payer: address,
    seller: verified.seller,
    amountWei: verified.amountWei.toString(),
    sellerAmountWei: verified.sellerAmountWei.toString(),
    platformAmountWei: verified.platformAmountWei.toString(),
  });
}

export async function GET() {
  return NextResponse.json({
    name: "arcdot.gateway",
    version: 2,
    minFeeWei: ARC.feeWei.toString(),
    platformFeeBps: ARC.platformFeeBps,
    feeUsdc: GATEWAY_FEE_USDC,
    chainId: ARC.chainId,
    gateway: ARC.gatewayAddress || null,
    demoUnlockAllowed: demoUnlockAllowed(),
  });
}
