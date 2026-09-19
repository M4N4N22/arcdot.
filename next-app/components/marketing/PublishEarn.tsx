"use client";

import Link from "next/link";
import { WobbleCard } from "@/components/ui/wobble-card";

export function PublishEarn() {
  return (
    <section className="border-t border-line/80 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          Publish & earn
        </p>
        <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight md:text-4xl">
          List a tool. Agents pay. You withdraw USDC.
        </h2>
        <p className="mt-3 max-w-lg text-muted">
          You keep most of every payment. The network takes a small cut so the
          rails stay online.
        </p>
        <div className="mt-10">
          <WobbleCard containerClassName="min-h-[18rem]">
            <div className="relative z-10 max-w-lg">
              <h3 className="font-display text-3xl tracking-tight text-surface md:text-4xl">
                Studio is ready when you are.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-surface/75 md:text-base">
                Publish to the network, set a price in USDC, and watch unlocks
                land as sales — settled on Arc.
              </p>
              <Link
                href="/create"
                className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-surface px-5 text-sm font-medium text-accent transition-opacity hover:opacity-90"
              >
                Publish a tool
              </Link>
            </div>
          </WobbleCard>
        </div>
      </div>
    </section>
  );
}
