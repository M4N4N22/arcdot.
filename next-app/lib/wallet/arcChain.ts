import { defineChain } from "viem";
import {
  ARC_MAINNET_CHAIN_ID,
  ARC_MAINNET_EXPLORER,
  ARC_MAINNET_RPC_DEFAULT,
  ARC_TESTNET_CHAIN_ID,
  ARC_TESTNET_EXPLORER,
  ARC_TESTNET_RPC_DEFAULT,
  getArcNetwork,
  getArcRpcUrl,
  getArcExplorerBase,
} from "@/lib/arc/network";

export const arcMainnet = defineChain({
  id: ARC_MAINNET_CHAIN_ID,
  name: "Arc",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_ARC_MAINNET_RPC_URL ??
          process.env.NEXT_PUBLIC_ARC_RPC_URL ??
          ARC_MAINNET_RPC_DEFAULT,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url:
        process.env.NEXT_PUBLIC_ARC_MAINNET_EXPLORER ?? ARC_MAINNET_EXPLORER,
    },
  },
});

export const arcTestnet = defineChain({
  id: ARC_TESTNET_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL ?? ARC_TESTNET_RPC_DEFAULT,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan Testnet",
      url:
        process.env.NEXT_PUBLIC_ARC_TESTNET_EXPLORER ?? ARC_TESTNET_EXPLORER,
    },
  },
  testnet: true,
});

/** Active chain for wallets / wagmi — follows NEXT_PUBLIC_ARC_NETWORK. */
export function getActiveArcChain() {
  return getArcNetwork() === "testnet" ? arcTestnet : arcMainnet;
}

/** @deprecated Use getActiveArcChain() */
export const arcActive = getActiveArcChain();

export function activeArcRpcUrl(): string {
  return getArcRpcUrl();
}

export function activeArcExplorerBase(): string {
  return getArcExplorerBase();
}
