export function buildUploadImageChallenge(params: {
  owner_address: string;
  issuedAt: number;
}): string {
  return [
    "arcdot.uploadServiceImage",
    `owner:${params.owner_address.toLowerCase()}`,
    `issuedAt:${params.issuedAt}`,
  ].join("\n");
}
