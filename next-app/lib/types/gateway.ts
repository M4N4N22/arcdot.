/** Shared gateway types — server + agent clients. Not for UI copy. */

export const ARC_CHAIN_ID = 5042 as const;
export const ARC_RPC_URL_DEFAULT = "https://rpc.mainnet.arc.io" as const;
export const NATIVE_USDC_DECIMALS = 18 as const;

/** 0.01 USDC in Arc native 18-decimal wei */
export const GATEWAY_FEE_WEI_DEFAULT = BigInt("10000000000000000");
export const GATEWAY_FEE_USDC = "0.01" as const;

export type GatewayErrorCode =
  | "MISSING_HEADERS"
  | "INVALID_SIGNATURE"
  | "TX_NOT_FOUND"
  | "TX_NOT_CONFIRMED"
  | "WRONG_CHAIN"
  | "WRONG_RECIPIENT"
  | "INSUFFICIENT_AMOUNT"
  | "TX_ALREADY_CONSUMED"
  | "PAYMENT_ID_UNUSED"
  | "PAYLOAD_INVALID"
  | "UPSTREAM_FAILED"
  | "GATEWAY_NOT_CONFIGURED"
  | "AMOUNT_MISMATCH"
  | "SERVICE_NOT_FOUND";

export interface GatewayTargetPayload {
  service: string;
  input: unknown;
  clientRequestId?: string;
}

export interface GatewayAuthMessage {
  domain: "arcdot.gateway";
  chainId: typeof ARC_CHAIN_ID;
  gateway: `0x${string}`;
  txHash: `0x${string}`;
  feeWei: string;
  service: string;
  inputHash: `0x${string}`;
  issuedAt: number;
  expiresAt: number;
}

export interface GatewayPaymentInstructions {
  chainId: typeof ARC_CHAIN_ID;
  gateway: `0x${string}`;
  feeWei: string;
  feeUsdc: string;
  method: "depositPayment";
  paymentIdHint: string;
  rpcUrl: string;
  explorerTxBase: string;
}

export interface Gateway402Body {
  ok: false;
  status: 402;
  error: {
    code: GatewayErrorCode;
    message: string;
    payment: GatewayPaymentInstructions;
  };
  requestId: string;
  timestamp: string;
}

export interface GatewaySettlement {
  txHash: `0x${string}`;
  payer: `0x${string}`;
  amountWei: string;
  amountUsdc: string;
  paymentId: `0x${string}`;
  blockNumber: number;
  verifiedAt: string;
}

export interface Gateway200Body {
  ok: true;
  status: 200;
  settlement: GatewaySettlement;
  result: unknown;
  meta: {
    requestId: string;
    service: string;
    latencyMs: number;
    mock: boolean;
    /** True when unlocked via DEMO_AGENT_SECRET (not an on-chain payment). */
    demo: boolean;
  };
}

export interface VerifiedArcPayment {
  txHash: `0x${string}`;
  payer: `0x${string}`;
  paymentId: `0x${string}`;
  amountWei: bigint;
  blockNumber: bigint;
  logIndex: number;
}
