import {
  ARC_CHAIN_ID,
  ARC_RPC_URL_DEFAULT,
  GATEWAY_FEE_USDC,
  GATEWAY_FEE_WEI_DEFAULT,
} from "@/lib/types/gateway";

export const ARC = {
  chainId: ARC_CHAIN_ID,
  rpcUrl:
    process.env.ARC_RPC_URL ??
    process.env.NEXT_PUBLIC_ARC_RPC_URL ??
    ARC_RPC_URL_DEFAULT,
  explorerTxBase: "https://explorer.arc.io/tx/",
  gatewayAddress: (process.env.PROMPT_GATEWAY_ADDRESS ||
    process.env.NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS ||
    "") as `0x${string}`,
  /** Platform minimum fee (on-chain floor). */
  feeWei: BigInt(
    process.env.GATEWAY_FEE_WEI ??
      process.env.NEXT_PUBLIC_GATEWAY_MIN_FEE_WEI ??
      GATEWAY_FEE_WEI_DEFAULT.toString(),
  ),
  feeUsdc: GATEWAY_FEE_USDC,
} as const;

/** Minimal ABI fragment for PromptGateway (minFee era). */
export const promptGatewayAbi = [
  {
    type: "function",
    name: "depositPayment",
    stateMutability: "payable",
    inputs: [{ name: "paymentId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "isUsed",
    stateMutability: "view",
    inputs: [{ name: "paymentId", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "minFee",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "feeAmount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "PaymentDeposited",
    inputs: [
      { name: "payer", type: "address", indexed: true },
      { name: "paymentId", type: "bytes32", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;
