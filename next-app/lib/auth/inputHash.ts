import { keccak256, stringToBytes, type Hex } from "viem";

/** Stable-enough JSON hash for binding payload to the signed challenge. */
export function hashGatewayInput(input: unknown): Hex {
  const canonical = JSON.stringify(input ?? null);
  return keccak256(stringToBytes(canonical));
}
