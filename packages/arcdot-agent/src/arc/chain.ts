import { defineChain } from "viem";
import {
  ARC_MAINNET_CHAIN_ID,
  ARC_MAINNET_EXPLORER,
  ARC_TESTNET_CHAIN_ID,
  ARC_TESTNET_EXPLORER,
  getArcNetwork,
  getArcRpcUrlDefault,
  networkFromChainId,
  type ArcNetworkId,
} from "../constants.js";

export function resolveRpcUrl(override?: string, network?: ArcNetworkId): string {
  if (override?.trim()) return override.trim();
  return getArcRpcUrlDefault(network ?? getArcNetwork());
}

export function arcChain(params?: {
  chainId?: number;
  rpcUrl?: string;
  network?: ArcNetworkId;
}) {
  const network =
    params?.network ??
    (params?.chainId != null
      ? networkFromChainId(params.chainId)
      : getArcNetwork());
  const chainId =
    params?.chainId ??
    (network === "testnet" ? ARC_TESTNET_CHAIN_ID : ARC_MAINNET_CHAIN_ID);
  const rpcUrl = resolveRpcUrl(params?.rpcUrl, network);
  const explorer =
    network === "testnet" ? ARC_TESTNET_EXPLORER : ARC_MAINNET_EXPLORER;

  return defineChain({
    id: chainId,
    name: network === "testnet" ? "Arc Testnet" : "Arc",
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
    rpcUrls: {
      default: { http: [rpcUrl] },
    },
    blockExplorers: {
      default: { name: "Arc Explorer", url: explorer },
    },
  });
}

/** @deprecated Use arcChain() */
export function arcMainnet(rpcUrl?: string) {
  return arcChain({ network: "mainnet", rpcUrl });
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
