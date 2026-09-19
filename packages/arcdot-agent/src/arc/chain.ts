import { defineChain } from "viem";
import { ARC_CHAIN_ID, ARC_EXPLORER, ARC_RPC_URL_DEFAULT } from "../constants.js";

export function resolveRpcUrl(override?: string): string {
  return (
    override ||
    process.env.ARC_RPC_URL ||
    process.env.NEXT_PUBLIC_ARC_RPC_URL ||
    ARC_RPC_URL_DEFAULT
  );
}

export function arcMainnet(rpcUrl?: string) {
  return defineChain({
    id: ARC_CHAIN_ID,
    name: "Arc",
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
    rpcUrls: {
      default: { http: [resolveRpcUrl(rpcUrl)] },
    },
    blockExplorers: {
      default: { name: "Arc Explorer", url: ARC_EXPLORER },
    },
  });
}

/** Minimal PromptGateway ABI for buyer settle. */
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
    name: "minFee",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
