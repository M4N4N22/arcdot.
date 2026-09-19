import Link from "next/link";

export function FinalCta() {
  return (
    <section className="border-t border-line/80 bg-surface/40 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface px-6 py-12 md:px-12 md:py-16">
          <h2 className="max-w-xl font-display text-3xl tracking-tight md:text-4xl">
            Ready to unlock access — or get paid for it?
          </h2>
          <p className="mt-4 max-w-md text-muted">
            Connect an assistant, browse live tools, or publish your own on Arc.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/services"
              className="inline-flex h-11 items-center justify-center bg-accent px-5 text-sm font-medium text-surface transition-opacity hover:opacity-90"
            >
              Explore tools
            </Link>
            <Link
              href="/hub"
              className="inline-flex h-11 items-center justify-center border border-line bg-background/80 px-5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              Connect MCP
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-11 items-center justify-center px-3 text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
