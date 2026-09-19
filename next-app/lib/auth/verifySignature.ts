import { hashMessage, recoverMessageAddress, type Hex } from "viem";
import type { GatewayAuthMessage } from "@/lib/types/gateway";

/** Canonical EIP-191 challenge string agents/wallets sign. */
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

export async function verifyGatewaySignature(params: {
  message: GatewayAuthMessage;
  signature: Hex;
  expectedAddress: `0x${string}`;
}): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  if (params.message.expiresAt < now) return false;
  if (params.message.issuedAt > now + 60) return false;

  const challenge = buildAuthChallenge(params.message);
  const recovered = await recoverMessageAddress({
    message: challenge,
    signature: params.signature,
  });

  return recovered.toLowerCase() === params.expectedAddress.toLowerCase();
}

export function challengeDigest(msg: GatewayAuthMessage): Hex {
  return hashMessage(buildAuthChallenge(msg));
}
