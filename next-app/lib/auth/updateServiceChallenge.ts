export function buildUpdateChallenge(params: {
  slug: string;
  owner_address: string;
  issuedAt: number;
  paused?: boolean;
  title?: string;
  price_usdc?: string;
}): string {
  return [
    "arcdot.updateService",
    `slug:${params.slug}`,
    `owner:${params.owner_address.toLowerCase()}`,
    `issuedAt:${params.issuedAt}`,
    params.title ? `title:${params.title}` : "",
    params.price_usdc ? `price:${params.price_usdc}` : "",
    typeof params.paused === "boolean" ? `paused:${params.paused}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
