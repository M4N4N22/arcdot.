export function buildUpdateChallenge(params: {
  slug: string;
  owner_address: string;
  issuedAt: number;
  paused?: boolean;
  title?: string;
  price_usdc?: string;
  upstream_url?: string;
}): string {
  return [
    "arcdot.updateService",
    `slug:${params.slug}`,
    `owner:${params.owner_address.toLowerCase()}`,
    `issuedAt:${params.issuedAt}`,
    params.title ? `title:${params.title}` : "",
    params.price_usdc ? `price:${params.price_usdc}` : "",
    typeof params.paused === "boolean" ? `paused:${params.paused}` : "",
    params.upstream_url !== undefined
      ? `upstream:${params.upstream_url}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
