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
  feeWei: BigInt(
    process.env.GATEWAY_FEE_WEI ??
      process.env.NEXT_PUBLIC_GATEWAY_MIN_FEE_WEI ??
      GATEWAY_FEE_WEI_DEFAULT.toString(),
  ),
  feeUsdc: GATEWAY_FEE_USDC,
  platformFeeBps: Number(process.env.PLATFORM_FEE_BPS ?? "1000"),
} as const;

/** PromptGateway V3 ABI (depositPayment signature unchanged from V2) */
export const promptGatewayAbi = [
  {
    type: "function",
    name: "depositPayment",
    stateMutability: "payable",
    inputs: [
      { name: "paymentId", type: "bytes32" },
      { name: "seller", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawSeller",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawPlatform",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "skimSurplus",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "previewSplit",
    stateMutability: "view",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [
      { name: "sellerAmount", type: "uint256" },
      { name: "platformAmount", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "pendingSeller",
    stateMutability: "view",
    inputs: [{ name: "seller", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "pendingPlatform",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalPending",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "paymentAmount",
    stateMutability: "view",
    inputs: [{ name: "paymentId", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
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
    name: "maxFee",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "platformFeeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "treasury",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
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
      { name: "seller", type: "address", indexed: true },
      { name: "paymentId", type: "bytes32", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "sellerAmount", type: "uint256", indexed: false },
      { name: "platformAmount", type: "uint256", indexed: false },
    ],
  },
] as const;
