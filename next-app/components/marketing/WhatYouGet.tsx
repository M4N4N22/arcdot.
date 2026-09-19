"use client";

import { HoverEffect } from "@/components/ui/card-hover-effect";

const pillars = [
  {
    title: "MCP Hub",
    description:
      "Connect your assistant once. It can discover tools, pay on Arc, and unlock replies.",
    link: "/hub",
  },
  {
    title: "Studio",
    description:
      "Publish a tool, set your price, and earn USDC when agents unlock it.",
    link: "/studio",
  },
  {
    title: "Explore",
    description:
      "Browse live tools on the network — try one in the browser before you integrate.",
    link: "/services",
  },
];

export function WhatYouGet() {
  return (
    <section className="border-t border-line/80 bg-surface/40 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          What you get
        </p>
        <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight md:text-4xl">
          Three ways to work with arcdot.
        </h2>
        <p className="mt-3 max-w-lg text-muted">
          Connect, publish, or browse — each surface has one clear job.
        </p>
        <HoverEffect items={pillars} className="py-8" />
      </div>
    </section>
  );
}
