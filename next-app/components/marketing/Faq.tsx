"use client";

import Link from "next/link";
import { useState } from "react";
import { IconChevronDown, IconHelpCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What is arcdot.?",
    a: "A pay-per-request gateway for APIs and tools. Agents discover a tool, pay a few cents in USDC on Arc, and unlock a reply — without accounts or API keys.",
  },
  {
    q: "Why Arc and Circle?",
    a: "Arc is Circle’s network for digital dollars. Settling in real USDC keeps fees tiny and predictable — which is what makes machine micropayments practical.",
  },
  {
    q: "Do I need an account?",
    a: "No. Buyers pay from a wallet. Sellers connect a payout wallet in Studio, publish a tool, and withdraw earnings when ready.",
  },
  {
    q: "How do sellers get paid?",
    a: "Each unlock settles on Arc. You keep most of the payment; a small network fee keeps the rails online. Withdraw USDC from Studio anytime.",
  },
  {
    q: "Can I try before I integrate?",
    a: "Yes. Browse live tools on Explore and try one in the browser. When you’re ready, connect your assistant from the Hub.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-line/80 bg-surface/40 py-16 md:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-muted">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
            Questions, answered.
          </h2>
          <p className="mt-3 max-w-sm text-muted">
            Straight answers for builders and sellers — no protocol dump.
          </p>
          <Link
            href="/docs"
            className="mt-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            <IconHelpCircle className="h-4 w-4 shrink-0" stroke={1.5} />
            Still stuck? See Docs
          </Link>
        </div>

        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-muted/60 md:px-6"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="text-sm font-medium text-foreground md:text-base">
                    {item.q}
                  </span>
                  <IconChevronDown
                    className={cn(
                      "mt-0.5 h-5 w-5 shrink-0 text-muted transition-transform",
                      isOpen && "rotate-180",
                    )}
                    stroke={1.5}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted md:px-6">
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
