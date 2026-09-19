import type { Hex } from "viem";
import { slugFromToolName } from "../mcp/toolNames.js";
import {
  parseMcpPaymentNeeded,
  paymentDepositArgs,
} from "./paymentParse.js";
import { settlePayment } from "../settle/pay.js";
import { resolvePrivateKey } from "../wallet/store.js";
import { resolveGateway } from "./gateway.js";

export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id: string | number | null;
  method: string;
  params?: unknown;
};

export type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};

export async function mcpRpc(
  origin: string,
  method: string,
  params?: unknown,
  id: number = 1,
): Promise<JsonRpcResponse> {
  const endpoint = new URL("/api/mcp", origin.replace(/\/$/, ""));
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params: params ?? {},
    }),
  });
  return (await res.json()) as JsonRpcResponse;
}

/**
 * Call a remote MCP tool; on PAYMENT_REQUIRED, settle from local wallet and retry.
 */
export async function callMcpToolWithAutoSettle(params: {
  origin: string;
  name: string;
  arguments?: Record<string, unknown>;
  privateKey?: Hex;
  rpcUrl?: string;
  gateway?: `0x${string}`;
}): Promise<JsonRpcResponse> {
  const origin = params.origin.replace(/\/$/, "");
  const args = { ...(params.arguments ?? {}) };

  const first = await mcpRpc(origin, "tools/call", {
    name: params.name,
    arguments: args,
  });

  if (first.error) return first;

  const needed = parseMcpPaymentNeeded(first.result);
  if (!needed) return first;

  const privateKey = params.privateKey ?? resolvePrivateKey();
  const deposit = paymentDepositArgs(needed.payment);
  const slug =
    needed.serviceSlug ||
    slugFromToolName(params.name) ||
    String(args.service ?? "");
  if (!slug) {
    throw new Error(
      `Cannot settle: missing service slug for tool ${params.name}`,
    );
  }

  const input = {
    prompt:
      typeof args.prompt === "string" ? args.prompt : JSON.stringify(args),
  };

  const gateway =
    params.gateway || deposit.gateway || (await resolveGateway(origin));

  const settled = await settlePayment({
    privateKey,
    gateway,
    seller: deposit.seller,
    service: slug,
    feeWei: deposit.feeWei,
    input,
    rpcUrl: params.rpcUrl,
  });

  const retryArgs = {
    ...args,
    payment: {
      txHash: settled.proof.txHash,
      address: settled.proof.address,
      signature: settled.proof.signature,
      issuedAt: settled.proof.issuedAt,
      expiresAt: settled.proof.expiresAt,
    },
  };

  return mcpRpc(origin, "tools/call", {
    name: params.name,
    arguments: retryArgs,
  }, 2);
}
