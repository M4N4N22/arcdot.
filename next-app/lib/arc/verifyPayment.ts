import {
  createPublicClient,
  decodeEventLog,
  http,
  type Hex,
  type Log,
} from "viem";
import { ARC, promptGatewayAbi } from "@/lib/arc/constants";
import type { VerifiedArcPayment } from "@/lib/types/gateway";

const arcMainnet = {
  id: ARC.chainId,
  name: "Arc",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: [ARC.rpcUrl] },
  },
} as const;

export function getArcClient() {
  return createPublicClient({
    chain: arcMainnet,
    transport: http(ARC.rpcUrl),
  });
}

export class PaymentVerificationError extends Error {
  constructor(
    public code:
      | "GATEWAY_NOT_CONFIGURED"
      | "TX_NOT_FOUND"
      | "TX_NOT_CONFIRMED"
      | "WRONG_RECIPIENT"
      | "INSUFFICIENT_AMOUNT"
      | "PAYMENT_ID_UNUSED"
      | "AMOUNT_MISMATCH",
    message: string,
  ) {
    super(message);
    this.name = "PaymentVerificationError";
  }
}

function parsePaymentDeposited(log: Log): {
  payer: `0x${string}`;
  paymentId: `0x${string}`;
  amount: bigint;
} | null {
  try {
    const decoded = decodeEventLog({
      abi: promptGatewayAbi,
      data: log.data,
      topics: log.topics,
    });
    if (decoded.eventName !== "PaymentDeposited") return null;
    const args = decoded.args as {
      payer: `0x${string}`;
      paymentId: `0x${string}`;
      amount: bigint;
    };
    return args;
  } catch {
    return null;
  }
}

/**
 * Verify a deposit receipt on Arc against PromptGateway.
 * @param expectedAmount Exact catalog price in native wei (18 decimals).
 */
export async function verifyArcPayment(params: {
  txHash: Hex;
  expectedPayer: `0x${string}`;
  expectedAmount: bigint;
}): Promise<VerifiedArcPayment> {
  if (!ARC.gatewayAddress || ARC.gatewayAddress.length !== 42) {
    throw new PaymentVerificationError(
      "GATEWAY_NOT_CONFIGURED",
      "PROMPT_GATEWAY_ADDRESS is not set",
    );
  }

  const client = getArcClient();
  const receipt = await client.getTransactionReceipt({
    hash: params.txHash,
  });

  if (!receipt) {
    throw new PaymentVerificationError("TX_NOT_FOUND", "Transaction not found");
  }
  if (receipt.status !== "success") {
    throw new PaymentVerificationError(
      "TX_NOT_CONFIRMED",
      "Transaction failed on-chain",
    );
  }

  const gateway = ARC.gatewayAddress.toLowerCase();
  let matched: VerifiedArcPayment | null = null;

  for (let i = 0; i < receipt.logs.length; i++) {
    const log = receipt.logs[i];
    if (log.address.toLowerCase() !== gateway) continue;

    const parsed = parsePaymentDeposited(log);
    if (!parsed) continue;

    if (parsed.payer.toLowerCase() !== params.expectedPayer.toLowerCase()) {
      continue;
    }
    if (parsed.amount < ARC.feeWei) {
      throw new PaymentVerificationError(
        "INSUFFICIENT_AMOUNT",
        `Paid ${parsed.amount}, platform minimum ${ARC.feeWei}`,
      );
    }
    if (parsed.amount !== params.expectedAmount) {
      throw new PaymentVerificationError(
        "AMOUNT_MISMATCH",
        `Paid ${parsed.amount}, service price ${params.expectedAmount}`,
      );
    }

    matched = {
      txHash: params.txHash,
      payer: parsed.payer,
      paymentId: parsed.paymentId,
      amountWei: parsed.amount,
      blockNumber: receipt.blockNumber,
      logIndex: i,
    };
    break;
  }

  if (!matched) {
    throw new PaymentVerificationError(
      "WRONG_RECIPIENT",
      "No matching PaymentDeposited event for this payer",
    );
  }

  const used = await client.readContract({
    address: ARC.gatewayAddress,
    abi: promptGatewayAbi,
    functionName: "isUsed",
    args: [matched.paymentId],
  });

  if (!used) {
    throw new PaymentVerificationError(
      "PAYMENT_ID_UNUSED",
      "Payment id is not marked used on-chain",
    );
  }

  return matched;
}
