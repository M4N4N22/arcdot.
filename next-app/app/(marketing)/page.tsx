import Link from "next/link";
import { FinalCta } from "@/components/marketing/FinalCta";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PublishEarn } from "@/components/marketing/PublishEarn";
import { SeeItSettle } from "@/components/marketing/SeeItSettle";
import { TrustedRails } from "@/components/marketing/TrustedRails";
import { WhatYouGet } from "@/components/marketing/WhatYouGet";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col">
      <section className="mx-auto flex min-h-[calc(100svh-5.5rem)] w-full max-w-6xl flex-col justify-center px-6 pb-16 pt-8 md:pb-24 md:pt-4">
        <div className="animate-fade-up max-w-2xl">
          <p className="font-display text-6xl leading-none tracking-tight md:text-8xl">
            arcdot.
          </p>
          <h1 className="mt-6 max-w-xl text-2xl font-medium leading-snug tracking-tight text-foreground md:mt-8 md:text-3xl">
            Software pays software. Instant USDC unlocks on Arc.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
            Agents discover gated APIs, pay a few cents in native USDC, and get
            a reply — no accounts, no API keys, no invoices.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/hub"
              className="inline-flex h-11 items-center justify-center bg-accent px-5 text-sm font-medium text-surface transition-opacity hover:opacity-90"
            >
              Connect MCP
            </Link>
            <Link
              href="/services"
              className="inline-flex h-11 items-center justify-center border border-line bg-surface/70 px-5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-surface"
            >
              Explore tools
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-11 items-center justify-center px-2 text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Documentation
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            Connect an assistant or browse live tools on Arc.
          </p>
        </div>
      </section>

      <TrustedRails />
      <HowItWorks />
      <WhatYouGet />
      <SeeItSettle />
      <PublishEarn />
      <FinalCta />

      <footer className="border-t border-line/80">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-muted">
          <span className="font-display text-lg text-foreground">arcdot.</span>
          <span>Settled in USDC on Circle’s Arc</span>
        </div>
      </footer>
    </main>
  );
}
