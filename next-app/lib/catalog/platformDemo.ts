import type { ServiceRow } from "@/lib/types/catalog";

/** Platform-owned placeholder wallet for the three seeded demo tools. */
export const PLATFORM_DEMO_OWNER =
  "0x00000000000000000000000000000000000000a1" as const;

/** Slugs that may use the platform Gemini key (no seller upstream). */
export const PLATFORM_DEMO_SLUGS = [
  "quick-brief",
  "tone-polish",
  "agent-checklist",
] as const;

export type PlatformDemoSlug = (typeof PLATFORM_DEMO_SLUGS)[number];

export function isPlatformDemoSlug(slug: string): boolean {
  return (PLATFORM_DEMO_SLUGS as readonly string[]).includes(slug);
}

/**
 * Gemini fulfillment is only for arcdot. demo tools.
 * Seller-published tools must provide their own HTTPS agent endpoint.
 */
export function isPlatformDemoService(
  service: Pick<ServiceRow, "slug" | "owner_address"> | null | undefined,
): boolean {
  if (!service) return false;
  const owner = service.owner_address.toLowerCase();
  return (
    owner === PLATFORM_DEMO_OWNER && isPlatformDemoSlug(service.slug)
  );
}
