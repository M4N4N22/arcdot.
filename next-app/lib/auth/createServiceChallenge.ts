export function buildCreateChallenge(params: {
  slug: string;
  title: string;
  price_usdc: string;
  owner_address: string;
  issuedAt: number;
  upstream_url?: string;
}): string {
  return [
    "arcdot.createService",
    `slug:${params.slug}`,
    `title:${params.title}`,
    `price:${params.price_usdc}`,
    `owner:${params.owner_address.toLowerCase()}`,
    `upstream:${params.upstream_url ?? ""}`,
    `issuedAt:${params.issuedAt}`,
  ].join("\n");
}
