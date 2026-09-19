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
} from "@/lib/types/gateway";
import { GATEWAY_FEE_USDC } from "@/lib/types/gateway";

export const runtime = "nodejs";

function paymentInstructions(): GatewayPaymentInstructions {
  return {
    chainId: ARC.chainId,
    gateway: ARC.gatewayAddress || ("0x0000000000000000000000000000000000000000" as const),
    feeWei: ARC.feeWei.toString(),
    feeUsdc: GATEWAY_FEE_USDC,
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
): NextResponse<Gateway402Body> {
  return NextResponse.json(
    {
      ok: false,
      status: 402,
      error: {
        code,
        message,
        payment: paymentInstructions(),
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

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const started = Date.now();

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
    );
  }

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

  if (!ARC.gatewayAddress) {
    return paymentRequired(
      "GATEWAY_NOT_CONFIGURED",
      "Gateway is not configured on the server",
      requestId,
    );
  }

  const txHash = headers.data.txHash as Hex;
  const address = headers.data.address as `0x${string}`;
  const signature = headers.data.signature as Hex;
  const inputHash = hashGatewayInput(body.data.input);

  const authMessage: GatewayAuthMessage = {
    domain: "arcdot.gateway",
    chainId: ARC.chainId,
    gateway: ARC.gatewayAddress,
    txHash,
    feeWei: ARC.feeWei.toString(),
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
    );
  }

  if (hasConsumedTx(txHash)) {
    return paymentRequired(
      "TX_ALREADY_CONSUMED",
      "This payment was already used",
      requestId,
    );
  }

  let verified;
  try {
    verified = await verifyArcPayment({
      txHash,
      expectedPayer: address,
    });
  } catch (err) {
    if (err instanceof PaymentVerificationError) {
      return paymentRequired(err.code, err.message, requestId);
    }
    console.error(err);
    return paymentRequired(
      "TX_NOT_FOUND",
      "Could not verify payment on Arc",
      requestId,
    );
  }

  markConsumedTx(txHash);

  try {
    const prompt = extractPrompt(body.data.input);
    const { text, mock } = await completeWithGemini(prompt);

    const response: Gateway200Body = {
      ok: true,
      status: 200,
      settlement: {
        txHash: verified.txHash,
        payer: verified.payer,
        amountWei: verified.amountWei.toString(),
        amountUsdc: GATEWAY_FEE_USDC,
        paymentId: verified.paymentId,
        blockNumber: Number(verified.blockNumber),
        verifiedAt: new Date().toISOString(),
      },
      result: {
        text,
        service: body.data.service,
      },
      meta: {
        requestId,
        service: body.data.service,
        latencyMs: Date.now() - started,
        mock,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        error: {
          code: "UPSTREAM_FAILED" as GatewayErrorCode,
          message: "Paid request could not be completed. Contact support with requestId.",
        },
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "arcdot.gateway",
    feeUsdc: GATEWAY_FEE_USDC,
    feeWei: ARC.feeWei.toString(),
    chainId: ARC.chainId,
    gateway: ARC.gatewayAddress || null,
  });
}
