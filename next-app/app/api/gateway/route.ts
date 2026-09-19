import { NextResponse } from "next/server";
import type { Hex } from "viem";
import { ARC } from "@/lib/arc/constants";
import {
  PaymentVerificationError,
  verifyArcPayment,
} from "@/lib/arc/verifyPayment";
import { hasConsumedTx, markConsumedTx } from "@/lib/arc/spentStore";
import { hashGatewayInput } from "@/lib/auth/inputHash";
import { verifyGatewaySignature } from "@/lib/auth/verifySignature";
import { getServiceBySlug, insertRequest } from "@/lib/catalog/store";
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
  GatewayPaymentInstructions,
  GatewaySettlement,
} from "@/lib/types/gateway";
import { GATEWAY_FEE_USDC } from "@/lib/types/gateway";
import type { ServiceRow } from "@/lib/types/catalog";

export const runtime = "nodejs";

const ZERO_ADDR =
  "0x0000000000000000000000000000000000000000" as const;
const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

function paymentInstructions(
  service?: ServiceRow | null,
): GatewayPaymentInstructions {
  const feeWei = service?.price_wei ?? ARC.feeWei.toString();
  const feeUsdc = service?.price_usdc ?? GATEWAY_FEE_USDC;
  return {
    chainId: ARC.chainId,
    gateway: ARC.gatewayAddress || ZERO_ADDR,
    feeWei,
    feeUsdc,
    method: "depositPayment",
    paymentIdHint:
      "bytes32 unique id, e.g. keccak256(abi.encode(payer, service, nonce))",
    rpcUrl: ARC.rpcUrl,
    explorerTxBase: ARC.explorerTxBase,
  };
}

function paymentRequired(
  code: GatewayErrorCode,
  message: string,
  requestId: string,
  service?: ServiceRow | null,
): NextResponse<Gateway402Body> {
  return NextResponse.json(
    {
      ok: false,
      status: 402,
      error: {
        code,
        message,
        payment: paymentInstructions(service),
      },
      requestId,
      timestamp: new Date().toISOString(),
    },
    { status: 402 },
  );
}

function extractPrompt(input: unknown): string {
  if (typeof input === "string") return input;
  if (input && typeof input === "object" && "prompt" in input) {
    const p = (input as { prompt: unknown }).prompt;
    if (typeof p === "string") return p;
  }
  return JSON.stringify(input ?? "");
}

function isDemoUnlock(request: Request): boolean {
  const secret = process.env.DEMO_AGENT_SECRET;
  if (!secret) return false;
  const provided = request.headers.get("x-arc-demo-secret");
  return Boolean(provided && provided === secret);
}

function demoSettlement(priceWei: string): GatewaySettlement {
  return {
    txHash: ZERO_HASH,
    payer: ZERO_ADDR,
    amountWei: priceWei,
    amountUsdc: GATEWAY_FEE_USDC,
    paymentId: ZERO_HASH,
    blockNumber: 0,
    verifiedAt: new Date().toISOString(),
  };
}

async function fulfillUpstream(params: {
  serviceRow: ServiceRow | null;
  serviceKey: string;
  input: unknown;
  requestId: string;
  started: number;
  settlement: GatewaySettlement;
  demo: boolean;
  payer?: string;
}): Promise<NextResponse> {
  const prompt = extractPrompt(params.input);
  try {
    const { text, mock } = await completeWithGemini(
      prompt,
      params.serviceRow?.system_prompt,
    );

    if (params.serviceRow && params.payer) {
      await insertRequest({
        service_id: params.serviceRow.id,
        service_slug: params.serviceRow.slug,
        payer_address: params.payer,
        tx_hash: params.settlement.txHash,
        payment_id: params.settlement.paymentId,
        status: "fulfilled",
        prompt,
        response_preview: text.slice(0, 500),
      }).catch((err) => console.error("insertRequest failed", err));
    }

    const response: Gateway200Body = {
      ok: true,
      status: 200,
      settlement: {
        ...params.settlement,
        amountUsdc: params.serviceRow?.price_usdc ?? params.settlement.amountUsdc,
      },
      result: {
        text,
        service: params.serviceKey,
      },
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
    if (params.serviceRow && params.payer) {
      await insertRequest({
        service_id: params.serviceRow.id,
        service_slug: params.serviceRow.slug,
        payer_address: params.payer,
        tx_hash: params.settlement.txHash,
        payment_id: params.settlement.paymentId,
        status: "failed",
        prompt,
        response_preview: null,
      }).catch(() => undefined);
    }
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
    return fulfillUpstream({
      serviceRow,
      serviceKey: body.data.service,
      input: body.data.input,
      requestId,
      started,
      settlement: demoSettlement(
        serviceRow?.price_wei ?? ARC.feeWei.toString(),
      ),
      demo: true,
      payer: "demo",
    });
  }

  if (!serviceRow || serviceRow.status !== "published") {
    return paymentRequired(
      "SERVICE_NOT_FOUND",
      "This service is not available",
      requestId,
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

  if (hasConsumedTx(txHash)) {
    return paymentRequired(
      "TX_ALREADY_CONSUMED",
      "This payment was already used",
      requestId,
      serviceRow,
    );
  }

  let verified;
  try {
    verified = await verifyArcPayment({
      txHash,
      expectedPayer: address,
      expectedAmount,
    });
  } catch (err) {
    if (err instanceof PaymentVerificationError) {
      const code =
        err.code === "AMOUNT_MISMATCH"
          ? "AMOUNT_MISMATCH"
          : (err.code as GatewayErrorCode);
      return paymentRequired(code, err.message, requestId, serviceRow);
    }
    console.error(err);
    return paymentRequired(
      "TX_NOT_FOUND",
      "Could not verify payment on Arc",
      requestId,
      serviceRow,
    );
  }

  markConsumedTx(txHash);

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
  });
}

export async function GET() {
  return NextResponse.json({
    name: "arcdot.gateway",
    minFeeWei: ARC.feeWei.toString(),
    feeUsdc: GATEWAY_FEE_USDC,
    chainId: ARC.chainId,
    gateway: ARC.gatewayAddress || null,
    demoUnlockConfigured: Boolean(process.env.DEMO_AGENT_SECRET),
  });
}
