export function buildCreateChallenge(params: {
  slug: string;
  title: string;
  price_usdc: string;
  owner_address: string;
  issuedAt: number;
}): string {
  return [
    "arcdot.createService",
    `slug:${params.slug}`,
    `title:${params.title}`,
    `price:${params.price_usdc}`,
    `owner:${params.owner_address.toLowerCase()}`,
    `issuedAt:${params.issuedAt}`,
  ].join("\n");
}
