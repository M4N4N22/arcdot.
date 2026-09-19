/** EIP-191 challenge for private Activity / Studio sales reads. */

export type SignedReadPurpose = "activity" | "sales";

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
