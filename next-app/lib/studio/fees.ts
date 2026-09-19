/** Client-safe platform fee helpers for Studio UI (SaaS copy, not chain jargon). */

export const PLATFORM_FEE_BPS = Number(
  process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS ?? "1000",
);

export function sellerKeepPercent(bps = PLATFORM_FEE_BPS): number {
  return Math.max(0, Math.min(100, (10_000 - bps) / 100));
}

export function networkFeePercent(bps = PLATFORM_FEE_BPS): number {
  return Math.max(0, Math.min(100, bps / 100));
}

/** Split a decimal USDC price string into buyer / seller / network amounts. */
export function splitPriceUsdc(
  priceUsdc: string,
  bps = PLATFORM_FEE_BPS,
): { buyer: number; seller: number; network: number } | null {
  const buyer = Number(priceUsdc);
  if (!Number.isFinite(buyer) || buyer < 0) return null;
  const network = (buyer * bps) / 10_000;
  const seller = buyer - network;
  return { buyer, seller, network };
}

export function formatUsdcAmount(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}
