import Image from "next/image";
import Link from "next/link";
import { BrandMark } from "@/components/explore/BrandMark";
import { getToolMeta, resolveToolImage } from "@/lib/explore/toolMeta";

export type ToolCardProps = {
  slug: string;
  title: string;
  description: string;
  priceUsdc: string;
  ownerLabel: string;
  ownerAddress: string;
  imageUrl?: string | null;
  category: string;
  compact?: boolean;
};

function priceTier(priceUsdc: string): string {
  const n = Number(priceUsdc);
  if (!Number.isFinite(n) || n <= 0) return "Free";
  if (n <= 0.01) return "Starter";
  return "Paid";
}

function OwnerAvatar({ label }: { label: string }) {
  const initial = (label.trim()[0] || "a").toUpperCase();
  return (
    <span
      aria-hidden
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground/[0.08] text-[9px] font-semibold text-foreground"
    >
      {initial}
    </span>
  );
}

/** Marketplace agent card — banner, mark, try CTA. */
export function ToolCard({
  slug,
  title,
  description,
  priceUsdc,
  ownerLabel,
  ownerAddress,
  imageUrl,
  category,
  compact = false,
}: ToolCardProps) {
  const meta = getToolMeta(slug, description);
  const image = resolveToolImage({ imageUrl, slug });
  const blurb = meta.tagline || description;
  const tier = priceTier(priceUsdc);
  const href = `/services/${slug}`;
  const tryHref = `/services/${slug}#try`;

  if (compact) {
    return (
      <article className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm transition-shadow hover:shadow-md">
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-3">
          {image ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line bg-surface">
              <Image
                src={image}
                alt=""
                fill
                className="object-cover"
                sizes="40px"
                unoptimized
              />
            </div>
          ) : (
            <BrandMark size="sm" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="truncate text-xs text-muted">{blurb}</p>
          </div>
          <p className="shrink-0 font-mono text-xs text-muted">
            {priceUsdc} USDC
          </p>
        </Link>
        <Link
          href={tryHref}
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-surface-muted px-3.5 text-xs font-semibold text-foreground ring-1 ring-line transition-colors hover:bg-foreground hover:text-surface"
        >
          Try
          <TryIcon />
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.15rem] border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <Link href={href} className="relative block">
        <div
          className="relative h-[7.25rem] overflow-hidden bg-[#eceae6]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,255,255,0.9), transparent 70%),
              radial-gradient(circle at 20% 30%, rgba(0,0,0,0.035) 0 1.2px, transparent 1.5px),
              radial-gradient(circle at 80% 40%, rgba(0,0,0,0.035) 0 1.2px, transparent 1.5px),
              radial-gradient(circle at 45% 70%, rgba(0,0,0,0.03) 0 1px, transparent 1.2px),
              linear-gradient(180deg, #f3f1ed 0%, #e8e5e0 100%)
            `,
            backgroundSize:
              "100% 100%, 22px 22px, 22px 22px, 18px 18px, 100% 100%",
          }}
        >
          <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full text-foreground/[0.04]"
            viewBox="0 0 320 64"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M0 40c40-18 80-18 120 0s80 18 120 0 80-18 80 0v24H0V40z"
            />
          </svg>

          <span className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-medium tracking-wide text-muted shadow-sm ring-1 ring-black/[0.06]">
            {tier}
          </span>
        </div>

        <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
          {image ? (
            <div className="relative h-[3.75rem] w-[3.75rem] overflow-hidden rounded-full border-[3px] border-surface bg-surface shadow-md">
              <Image
                src={image}
                alt=""
                fill
                className="object-cover"
                sizes="60px"
                unoptimized
              />
            </div>
          ) : (
            <div className="rounded-full border-[3px] border-surface shadow-md">
              <BrandMark
                size="xl"
                className="h-[3.75rem] w-[3.75rem] text-[1.35rem]"
              />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-9">
        <Link href={href} className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold leading-snug tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-1.5 line-clamp-2 min-h-[2.25rem] text-[12px] leading-relaxed text-muted">
            {blurb}
          </p>
        </Link>

        <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-muted">
          <PriceDot />
          <span className="font-medium text-foreground/80">
            {priceUsdc} USDC
          </span>
          <span className="text-muted/50">·</span>
          <span className="truncate">{category}</span>
        </p>

        <div className="mt-2.5 flex items-center gap-2">
          <OwnerAvatar label={ownerLabel} />
          <Link
            href={`/u/${ownerAddress}`}
            className="truncate text-[12px] text-muted transition-colors hover:text-foreground"
          >
            {ownerLabel}
          </Link>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={tryHref}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#efeeea] text-[13px] font-semibold text-foreground ring-1 ring-black/[0.04] transition-colors hover:bg-foreground hover:text-surface"
          >
            <TryIcon />
            Try
          </Link>
          <Link
            href={href}
            aria-label={`Open ${title}`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#efeeea] text-muted ring-1 ring-black/[0.04] transition-colors hover:text-foreground"
          >
            <DetailIcon />
          </Link>
        </div>
      </div>
    </article>
  );
}

function TryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M5 3.5 9 7l-4 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DetailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 5.25v3.25M8 10.6h.01"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PriceDot() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="5" fill="#E8B84A" fillOpacity="0.25" />
      <circle cx="6" cy="6" r="2.25" fill="#D4A017" />
    </svg>
  );
}
