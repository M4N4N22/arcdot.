import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcMainnet, promptGatewayAbi, resolveRpcUrl } from "../arc/chain.js";
import {
  buildAuthChallenge,
  buildGatewayAuthMessage,
} from "../auth/challenge.js";
import type { PaymentProof } from "../constants.js";
import { makePaymentId } from "./paymentId.js";

export type SettleParams = {
  privateKey: Hex;
  gateway: `0x${string}`;
  seller: `0x${string}`;
  service: string;
  feeWei: bigint;
  input: unknown;
  rpcUrl?: string;
};

export type SettleResult = {
  paymentId: Hex;
  proof: PaymentProof;
  feeWei: bigint;
};

/** On-chain deposit + EIP-191 proof for gateway / MCP retry. */
export async function settlePayment(
  params: SettleParams,
): Promise<SettleResult> {
  const account = privateKeyToAccount(params.privateKey);
  const chain = arcMainnet(params.rpcUrl);
  const rpcUrl = resolveRpcUrl(params.rpcUrl);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });

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
  rpcUrl?: string,
): Promise<{ wei: bigint; formatted: string }> {
  const publicClient = createPublicClient({
    chain: arcMainnet(rpcUrl),
    transport: http(resolveRpcUrl(rpcUrl)),
  });
  const wei = await publicClient.getBalance({ address });
  return { wei, formatted: formatEther(wei) };
}
