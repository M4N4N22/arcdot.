import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcChain, promptGatewayAbi, resolveRpcUrl } from "../arc/chain.js";
import {
  buildAuthChallenge,
  buildGatewayAuthMessage,
} from "../auth/challenge.js";
import type { PaymentProof } from "../constants.js";
import {
  getWalletStatus,
  type WalletStatus,
} from "../wallet/status.js";
import { makePaymentId } from "./paymentId.js";

export type SettleParams = {
  privateKey: Hex;
  gateway: `0x${string}`;
  seller: `0x${string}`;
  service: string;
  feeWei: bigint;
  input: unknown;
  /** Prefer values from 402 payment instructions. */
  chainId?: number;
  rpcUrl?: string;
};

export type SettleResult = {
  paymentId: Hex;
  proof: PaymentProof;
  feeWei: bigint;
};

export class InsufficientFundsError extends Error {
  readonly code = "INSUFFICIENT_FUNDS" as const;

  constructor(
    public readonly status: WalletStatus,
    public readonly requiredWei: bigint,
  ) {
    const need = formatEther(requiredWei);
    super(
      `Payment needed: have ${status.balanceUsdc} USDC, need ${need} USDC. Fund ${status.address} then retry.`,
    );
    this.name = "InsufficientFundsError";
  }
}

/** On-chain deposit + EIP-191 proof for gateway / MCP retry. */
export async function settlePayment(
  params: SettleParams,
): Promise<SettleResult> {
  const account = privateKeyToAccount(params.privateKey);
  const chain = arcChain({
    chainId: params.chainId,
    rpcUrl: params.rpcUrl,
  });
  const rpcUrl = params.rpcUrl?.trim() || resolveRpcUrl(undefined);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });

  const status = await getWalletStatus({
    address: account.address,
    rpcUrl,
    chainId: chain.id,
  });
  if (BigInt(status.balanceWei) < params.feeWei) {
    throw new InsufficientFundsError(status, params.feeWei);
  }

  const paymentId = makePaymentId({
    payer: account.address,
    service: params.service,
    nonce: Date.now(),
  });

  const txHash = await walletClient.writeContract({
    address: params.gateway,
    abi: promptGatewayAbi,
    functionName: "depositPayment",
    args: [paymentId, params.seller],
    value: params.feeWei,
    chain,
    account,
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });

  const now = Math.floor(Date.now() / 1000);
  const authMessage = buildGatewayAuthMessage({
    gateway: params.gateway,
    txHash,
    feeWei: params.feeWei,
    service: params.service,
    input: params.input,
    issuedAt: now,
    expiresAt: now + 120,
    chainId: chain.id,
  });
  const signature = await walletClient.signMessage({
    account,
    message: buildAuthChallenge(authMessage),
  });

  return {
    paymentId,
    feeWei: params.feeWei,
    proof: {
      txHash,
      address: account.address,
      signature,
      issuedAt: now,
      expiresAt: now + 120,
    },
  };
}

export async function getNativeBalance(
  address: `0x${string}`,
  opts?: { rpcUrl?: string; chainId?: number },
): Promise<{ wei: bigint; formatted: string }> {
  const chain = arcChain({
    chainId: opts?.chainId,
    rpcUrl: opts?.rpcUrl,
  });
  const publicClient = createPublicClient({
    chain,
    transport: http(resolveRpcUrl(opts?.rpcUrl)),
  });
  const wei = await publicClient.getBalance({ address });
  return { wei, formatted: formatEther(wei) };
}
