/**
 * End-to-end paid agent unlock: catalog → depositPayment → EIP-191 → /api/gateway.
 * For scripts and autonomous clients. Not for browser UI.
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  buildGatewayAuthMessage,
  callGatewayPaid,
  getAuthChallengeText,
  type GatewayCallResult,
} from "@/lib/agent/client";
import { makePaymentId } from "@/lib/agent/paymentId";
import { promptGatewayAbi } from "@/lib/arc/constants";
import { ARC_CHAIN_ID } from "@/lib/types/gateway";
import { arcMainnet } from "@/lib/wallet/arcChain";

export type PaidAgentService = {
  slug: string;
  price_wei: string;
  seller: `0x${string}`;
};

export type RunPaidAgentRequestParams = {
  baseUrl: string;
  service: string;
  input: unknown;
  /** 0x-prefixed private key for the paying agent wallet */
  privateKey: Hex;
  rpcUrl?: string;
  gateway?: `0x${string}`;
  clientRequestId?: string;
};

export type RunPaidAgentRequestResult = {
  paymentId: Hex;
  txHash: Hex;
  gateway: GatewayCallResult;
};

async function fetchService(
  baseUrl: string,
  slug: string,
): Promise<PaidAgentService> {
  const res = await fetch(new URL(`/api/services/${slug}`, baseUrl));
  const json = (await res.json()) as {
    service?: {
      slug: string;
      price_wei: string;
      seller?: string;
      owner_address?: string;
    };
    gateway?: string | null;
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
  };
}

async function resolveGateway(
  baseUrl: string,
  override?: `0x${string}`,
): Promise<`0x${string}`> {
  if (override && override.length === 42) return override;
  const res = await fetch(new URL("/api/services", baseUrl));
  const json = (await res.json()) as { gateway?: string | null };
  if (json.gateway && json.gateway.length === 42) {
    return json.gateway as `0x${string}`;
  }
  throw new Error(
    "Gateway address not configured. Set PROMPT_GATEWAY_ADDRESS on the server.",
  );
}

/**
 * Pay on Arc and unlock a catalog service. Spends native USDC from `privateKey`.
 */
export async function runPaidAgentRequest(
  params: RunPaidAgentRequestParams,
): Promise<RunPaidAgentRequestResult> {
  const rpcUrl =
    params.rpcUrl ??
    process.env.ARC_RPC_URL ??
    process.env.NEXT_PUBLIC_ARC_RPC_URL ??
    "https://rpc.mainnet.arc.io";

  const account: Account = privateKeyToAccount(params.privateKey);
  const publicClient = createPublicClient({
    chain: arcMainnet,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain: arcMainnet,
    transport: http(rpcUrl),
  });

  const [service, gateway] = await Promise.all([
    fetchService(params.baseUrl, params.service),
    resolveGateway(params.baseUrl, params.gateway),
  ]);

  const priceWei = BigInt(service.price_wei);
  const paymentId = makePaymentId({
    payer: account.address,
    service: service.slug,
    nonce: Date.now(),
  });

  const txHash = await walletClient.writeContract({
    address: gateway,
    abi: promptGatewayAbi,
    functionName: "depositPayment",
    args: [paymentId, service.seller],
    value: priceWei,
    chain: arcMainnet,
    account,
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });

  const now = Math.floor(Date.now() / 1000);
  const authMessage = buildGatewayAuthMessage({
    gateway,
    txHash,
    feeWei: priceWei,
    service: service.slug,
    input: params.input,
    issuedAt: now,
    expiresAt: now + 120,
  });
  const challenge = getAuthChallengeText(authMessage);
  const signature = await walletClient.signMessage({
    account,
    message: challenge,
  });

  const gatewayResult = await callGatewayPaid({
    baseUrl: params.baseUrl,
    service: service.slug,
    input: params.input,
    gateway,
    feeWei: priceWei,
    txHash,
    address: account.address,
    signature,
    issuedAt: now,
    expiresAt: now + 120,
    clientRequestId: params.clientRequestId,
  });

  return { paymentId, txHash, gateway: gatewayResult };
}

/** Convenience: parse AGENT_PRIVATE_KEY from env. */
export function agentPrivateKeyFromEnv(): Hex {
  const key = process.env.AGENT_PRIVATE_KEY;
  if (!key || !/^0x[a-fA-F0-9]{64}$/.test(key)) {
    throw new Error(
      "Set AGENT_PRIVATE_KEY to a 0x-prefixed 32-byte hex private key.",
    );
  }
  return key as Hex;
}

export { ARC_CHAIN_ID };
