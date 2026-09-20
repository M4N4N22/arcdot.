import { defineChain } from "viem";
import {
  ARC_MAINNET_CHAIN_ID,
  ARC_MAINNET_EXPLORER,
  ARC_MAINNET_RPC_DEFAULT,
  ARC_TESTNET_CHAIN_ID,
  ARC_TESTNET_EXPLORER,
  ARC_TESTNET_RPC_DEFAULT,
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

/**
 * Wallet / wagmi chain — Arc Mainnet only.
 * Testnet is not offered in WalletConnect (production is mainnet-only).
 */
export function getActiveArcChain() {
  return arcMainnet;
}

/** @deprecated Use getActiveArcChain() */
export const arcActive = arcMainnet;

export function activeArcRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_ARC_MAINNET_RPC_URL?.trim() ||
    process.env.NEXT_PUBLIC_ARC_RPC_URL?.trim() ||
    ARC_MAINNET_RPC_DEFAULT
  );
}

export function activeArcExplorerBase(): string {
  return (
    process.env.NEXT_PUBLIC_ARC_MAINNET_EXPLORER?.trim() || ARC_MAINNET_EXPLORER
  );
}
