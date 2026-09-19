/** EIP-191 challenge for private Activity / Studio sales / profile reads. */

export type SignedReadPurpose = "session" | "activity" | "sales";

/** Server accepts signatures newer than this (seconds). */
export const SIGNED_READ_TTL_SEC = 60 * 60; // 1 hour

export function buildSignedReadChallenge(params: {
  purpose: SignedReadPurpose;
  address: string;
  issuedAt: number;
}): string {
  return [
    `arcdot.read.${params.purpose}`,
    `address:${params.address.toLowerCase()}`,
    `issuedAt:${params.issuedAt}`,
  ].join("\n");
}
