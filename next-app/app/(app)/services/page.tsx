import Link from "next/link";
import { UsdcOnArcMark } from "@/components/brand/UsdcOnArcMark";
import { ExploreBrowser } from "@/components/explore/ExploreBrowser";
import type { ExploreToolItem } from "@/components/explore/types";
import {
  getProfilesByAddresses,
  listPublishedServices,
} from "@/lib/catalog/store";
import { getToolMeta } from "@/lib/explore/toolMeta";

export const dynamic = "force-dynamic";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default async function ExplorePage() {
  const services = await listPublishedServices();
  const profiles = await getProfilesByAddresses(
    services.map((s) => s.owner_address),
  );

  const tools: ExploreToolItem[] = services.map((s) => {
    const profile = profiles.get(s.owner_address.toLowerCase());
    const meta = getToolMeta(s.slug, s.description);
    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: s.description,
      priceUsdc: s.price_usdc,
      priceNum: Number(s.price_usdc) || 0,
      ownerLabel: profile?.display_name || shortAddr(s.owner_address),
      ownerAddress: s.owner_address,
      imageUrl: s.image_url ?? null,
      category: meta.category,
      createdAt: s.created_at,
    };
  });

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 pb-16 pt-5 md:px-6 md:pt-6">
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <UsdcOnArcMark size="sm" />
          <h1 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
            Explore
          </h1>
          <p className="mt-1.5 max-w-lg text-sm text-muted">
            Browse live tools priced in USDC on Arc — search, filter, and try
            any of them in the browser.
          </p>
        </div>
      </div>

      <ExploreBrowser tools={tools} />

      <footer className="mt-12 flex flex-wrap gap-3 px-1 text-sm">
        <Link
          href="/hub"
          className="inline-flex h-10 items-center rounded-full border border-line bg-surface px-4 shadow-sm transition-colors hover:bg-surface-muted"
        >
          Connect via MCP Hub
        </Link>
        <Link
          href="/create"
          className="inline-flex h-10 items-center rounded-full bg-accent px-4 font-medium text-surface"
        >
          Publish a tool
        </Link>
      </footer>
    </main>
  );
}
