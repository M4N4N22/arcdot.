import Link from "next/link";
import { IconRocket } from "@tabler/icons-react";

export function FinalCta() {
  return (
    <section className="border-t border-line/80 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-accent px-6 py-12 text-surface md:px-12 md:py-16">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface/10">
            <IconRocket className="h-5 w-5" stroke={1.5} />
          </div>
          <h2 className="mt-6 max-w-xl font-display text-3xl tracking-tight md:text-4xl">
            Ready to unlock access — or get paid for it?
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-surface/75 md:text-base">
            Connect an assistant, browse live tools, or publish your own on Arc.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/services"
              className="inline-flex h-11 items-center justify-center rounded-md bg-surface px-5 text-sm font-medium text-accent transition-opacity hover:opacity-90"
            >
              Explore tools
            </Link>
            <Link
              href="/hub"
              className="inline-flex h-11 items-center justify-center rounded-md border border-surface/25 bg-transparent px-5 text-sm font-medium text-surface transition-colors hover:bg-surface/10"
            >
              Connect MCP
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-11 items-center justify-center px-3 text-sm font-medium text-surface/70 underline-offset-4 transition-colors hover:text-surface hover:underline"
            >
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
