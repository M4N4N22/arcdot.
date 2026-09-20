"use client";

import Image from "next/image";
import { BrandMark } from "@/components/explore/BrandMark";

type PublishPreviewProps = {
  title: string;
  description: string;
  priceUsdc: string;
  slug: string;
  imageUrl: string | null;
  ownerLabel: string;
};

/** Live Explore-style preview while publishing. */
export function PublishPreview({
  title,
  description,
  priceUsdc,
  slug,
  imageUrl,
  ownerLabel,
}: PublishPreviewProps) {
  const displayTitle = title.trim() || "Your tool name";
  const displayDesc =
    description.trim() || "A short line about what buyers get.";
  const displayPrice = priceUsdc.trim() || "0.01";
  const displaySlug = slug.trim() || "tool-key";

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
        Explore preview
      </p>
      <div className="mt-3 flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BrandMark size="sm" className="border-0 shadow-none" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold tracking-tight">{displayTitle}</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted">{displayDesc}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="font-mono">{displayPrice} USDC</span>
            <span className="truncate">{ownerLabel}</span>
          </div>
          <p className="mt-1 truncate font-mono text-[11px] text-muted">
            /services/{displaySlug}
          </p>
        </div>
      </div>
    </div>
  );
}
