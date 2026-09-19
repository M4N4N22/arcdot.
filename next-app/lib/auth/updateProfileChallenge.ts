export function buildUpdateProfileChallenge(params: {
  owner_address: string;
  display_name: string;
  issuedAt: number;
  webhook_url?: string;
}): string {
  return [
    "arcdot.updateProfile",
    `owner:${params.owner_address.toLowerCase()}`,
    `displayName:${params.display_name}`,
    `webhook:${params.webhook_url ?? ""}`,
    `issuedAt:${params.issuedAt}`,
  ].join("\n");
}
