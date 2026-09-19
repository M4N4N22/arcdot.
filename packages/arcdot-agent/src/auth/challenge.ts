import { keccak256, stringToBytes, type Hex } from "viem";
import { ARC_CHAIN_ID, type GatewayAuthMessage } from "../constants.js";

export function hashGatewayInput(input: unknown): Hex {
  return keccak256(stringToBytes(JSON.stringify(input ?? null)));
}

export function buildAuthChallenge(msg: GatewayAuthMessage): string {
  return [
    "arcdot.gateway",
    `chainId:${msg.chainId}`,
    `gateway:${msg.gateway.toLowerCase()}`,
    `txHash:${msg.txHash.toLowerCase()}`,
    `feeWei:${msg.feeWei}`,
    `service:${msg.service}`,
    `inputHash:${msg.inputHash.toLowerCase()}`,
    `issuedAt:${msg.issuedAt}`,
    `expiresAt:${msg.expiresAt}`,
  ].join("\n");
}

export function buildGatewayAuthMessage(params: {
  gateway: `0x${string}`;
  txHash: Hex;
  feeWei: bigint;
  service: string;
  input: unknown;
  issuedAt: number;
  expiresAt: number;
}): GatewayAuthMessage {
  return {
    domain: "arcdot.gateway",
    chainId: ARC_CHAIN_ID,
    gateway: params.gateway,
    txHash: params.txHash,
    feeWei: params.feeWei.toString(),
    service: params.service,
    inputHash: hashGatewayInput(params.input),
    issuedAt: params.issuedAt,
    expiresAt: params.expiresAt,
  };
}
