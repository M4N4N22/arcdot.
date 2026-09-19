/** Shared constants — mirror next-app Arc locks (18-decimal native USDC). */

export const ARC_CHAIN_ID = 5042 as const;
export const ARC_RPC_URL_DEFAULT = "https://rpc.mainnet.arc.io" as const;
export const ARC_EXPLORER = "https://explorer.arc.io" as const;
export const GATEWAY_FEE_WEI_DEFAULT = 10_000_000_000_000_000n;

export type GatewayAuthMessage = {
  domain: "arcdot.gateway";
  chainId: typeof ARC_CHAIN_ID;
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
