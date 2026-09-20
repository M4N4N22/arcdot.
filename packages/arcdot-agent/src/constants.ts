/** Shared constants — mirror next-app Arc locks (18-decimal native USDC). */

export const ARC_MAINNET_CHAIN_ID = 5042 as const;
export const ARC_TESTNET_CHAIN_ID = 5042002 as const;

/** @deprecated Prefer getArcChainId() */
export const ARC_CHAIN_ID = ARC_MAINNET_CHAIN_ID;

export const ARC_MAINNET_RPC_DEFAULT = "https://rpc.mainnet.arc.io" as const;
export const ARC_TESTNET_RPC_DEFAULT = "https://rpc.testnet.arc.io" as const;
export const ARC_RPC_URL_DEFAULT = ARC_MAINNET_RPC_DEFAULT;

export const ARC_MAINNET_EXPLORER = "https://explorer.arc.io" as const;
export const ARC_TESTNET_EXPLORER = "https://testnet.arcscan.app" as const;
export const ARC_EXPLORER = ARC_MAINNET_EXPLORER;

export const GATEWAY_FEE_WEI_DEFAULT = 10_000_000_000_000_000n;

export type ArcNetworkId = "mainnet" | "testnet";

export function getArcNetwork(): ArcNetworkId {
  const env =
    process.env.ARC_NETWORK ?? process.env.NEXT_PUBLIC_ARC_NETWORK ?? "mainnet";
  const v = env.trim().toLowerCase();
  if (v === "testnet" || v === "arc-testnet" || v === "5042002") return "testnet";
  return "mainnet";
}

export function getArcChainId(network = getArcNetwork()): number {
  return network === "testnet" ? ARC_TESTNET_CHAIN_ID : ARC_MAINNET_CHAIN_ID;
}

export function getArcRpcUrlDefault(network = getArcNetwork()): string {
  if (network === "testnet") {
    return (
      process.env.ARC_TESTNET_RPC_URL?.trim() ||
      process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL?.trim() ||
      ARC_TESTNET_RPC_DEFAULT
    );
  }
  return (
    process.env.ARC_RPC_URL?.trim() ||
    process.env.NEXT_PUBLIC_ARC_RPC_URL?.trim() ||
    process.env.ARC_MAINNET_RPC_URL?.trim() ||
    ARC_MAINNET_RPC_DEFAULT
  );
}

export function networkFromChainId(chainId: number): ArcNetworkId {
  return chainId === ARC_TESTNET_CHAIN_ID ? "testnet" : "mainnet";
}

export type GatewayAuthMessage = {
  domain: "arcdot.gateway";
  chainId: number;
  gateway: `0x${string}`;
  txHash: `0x${string}`;
  feeWei: string;
  service: string;
  inputHash: `0x${string}`;
  issuedAt: number;
  expiresAt: number;
};

export type PaymentProof = {
  txHash: `0x${string}`;
  address: `0x${string}`;
  signature: `0x${string}`;
  issuedAt: number;
  expiresAt: number;
};
