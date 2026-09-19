export function buildUpdateProfileChallenge(params: {
  owner_address: string;
  display_name: string;
  issuedAt: number;
}): string {
  return [
    "arcdot.updateProfile",
    `owner:${params.owner_address.toLowerCase()}`,
    `displayName:${params.display_name}`,
    `issuedAt:${params.issuedAt}`,
  ].join("\n");
}
