"use client";

import Image from "next/image";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const rails = [
  {
    quote:
      "Circle’s Arc network is built for money movement — stable, predictable, and ready for machine payments.",
    name: "Arc",
    title: "Circle’s L1 for digital dollars",
  },
  {
    quote:
      "Settle in real USDC. Tiny fees make micropayments practical for agents buying API access.",
    name: "USDC",
    title: "Native digital dollars on Arc",
  },
  {
    quote:
      "arcdot. sits on top: agents pay a few cents, unlock a reply, and sellers earn without invoices.",
    name: "arcdot.",
    title: "Pay-per-request for tools",
  },
  {
    quote:
      "No middleman tokens. No accounts to provision. Just wallets, USDC, and instant unlocks.",
    name: "Instant unlocks",
    title: "Built for software that pays software",
  },
];

export function TrustedRails() {
  return (
    <section className="border-t border-line/80 bg-surface/40 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Image
            src="/brand/arc-network.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full"
          />
          <p className="text-sm font-medium uppercase tracking-wider text-muted">
            Trusted rails
          </p>
        </div>
        <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-tight md:text-4xl">
          Built on Circle’s Arc. Settled in USDC.
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          Real digital dollars on a network designed for money — so agents can
          pay a few cents and unlock access without the usual billing stack.
        </p>
      </div>
      <div className="mt-10 flex justify-center px-2">
        <InfiniteMovingCards items={rails} direction="left" speed="slow" />
      </div>
    </section>
  );
}
