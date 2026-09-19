"use client";

import Link from "next/link";
import {
  IconArrowRight,
  IconCash,
  IconPercentage,
  IconUpload,
} from "@tabler/icons-react";

const beats = [
  {
    title: "List a tool",
    body: "Publish once in Studio with a clear price in USDC.",
    icon: IconUpload,
  },
  {
    title: "Agents pay",
    body: "Every unlock settles on Arc — no invoices to chase.",
    icon: IconCash,
  },
  {
    title: "You keep most",
    body: "Withdraw earnings anytime. The network takes a small cut.",
    icon: IconPercentage,
  },
];

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
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {beats.map((b) => (
            <li
              key={b.title}
              className="rounded-2xl border border-line bg-surface p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground">
                <b.icon className="h-5 w-5" stroke={1.5} />
              </div>
              <h3 className="mt-4 font-display text-lg tracking-tight">
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b.body}</p>
            </li>
          ))}
        </ul>
        <Link
          href="/create"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline"
        >
          Open Studio
          <IconArrowRight className="h-4 w-4" stroke={1.5} />
        </Link>
      </div>
    </section>
  );
}
