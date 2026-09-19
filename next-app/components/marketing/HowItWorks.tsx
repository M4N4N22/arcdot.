"use client";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

const steps = [
  {
    title: "Discover",
    description:
      "Browse live tools on Explore, or let your assistant find what it needs.",
    header: (
      <div className="flex h-16 items-end rounded-xl bg-surface-muted px-4 py-3">
        <span className="font-display text-4xl text-foreground/15">01</span>
      </div>
    ),
  },
  {
    title: "Pay a few cents",
    description:
      "The agent wallet sends a tiny USDC payment on Arc — no accounts, no invoices.",
    header: (
      <div className="flex h-16 items-end rounded-xl bg-surface-muted px-4 py-3">
        <span className="font-display text-4xl text-foreground/15">02</span>
      </div>
    ),
  },
  {
    title: "Get a reply",
    description:
      "arcdot. confirms payment and unlocks the response in seconds.",
    header: (
      <div className="flex h-16 items-end rounded-xl bg-surface-muted px-4 py-3">
        <span className="font-display text-4xl text-foreground/15">03</span>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-line/80 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          How it works
        </p>
        <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight md:text-4xl">
          Discover. Pay. Unlock.
        </h2>
        <p className="mt-3 max-w-lg text-muted">
          One loop for every gated tool — simple enough for an agent to run on
          its own.
        </p>
        <div className="mt-10">
          <BentoGrid>
            {steps.map((step) => (
              <BentoGridItem
                key={step.title}
                title={step.title}
                description={step.description}
                header={step.header}
              />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
}
