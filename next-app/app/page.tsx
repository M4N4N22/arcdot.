import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-6 pb-24 pt-10 md:pt-16">
      <section className="animate-fade-up max-w-2xl">
        <p className="mb-4 font-display text-5xl leading-none tracking-tight md:text-7xl">
          arcdot.
        </p>
        <h1 className="max-w-xl text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
          Tiny payments. Instant API access for agents.
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
          Publish a gated service, set a USDC price, and let agents — or anyone
          with a wallet — pay and unlock on Arc. No accounts. No invoices.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/services"
            className="inline-flex h-11 items-center justify-center bg-accent px-5 text-sm font-medium text-surface transition-opacity hover:opacity-90"
          >
            Browse services
          </Link>
          <Link
            href="/create"
            className="inline-flex h-11 items-center justify-center border border-line bg-surface/60 px-5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-surface"
          >
            Create a service
          </Link>
        </div>
      </section>

      <section className="animate-fade-up mt-28 max-w-2xl" style={{ animationDelay: "120ms" }}>
        <h2 className="font-display text-3xl tracking-tight md:text-4xl">
          How it works
        </h2>
        <p className="mt-3 text-muted">
          Built for autonomous clients that need to buy a single answer and move
          on — and for builders who want to monetize without billing software.
        </p>
        <ol className="mt-10 space-y-8 border-l border-line pl-6">
          <li>
            <p className="text-sm font-medium uppercase tracking-wider text-muted">
              01
            </p>
            <p className="mt-1 text-lg font-medium">Publish a service</p>
            <p className="mt-1 text-muted">
              Name it, set a price in USDC, and describe what buyers get.
            </p>
          </li>
          <li>
            <p className="text-sm font-medium uppercase tracking-wider text-muted">
              02
            </p>
            <p className="mt-1 text-lg font-medium">Buyers pay on Arc</p>
            <p className="mt-1 text-muted">
              A few cents settles in native USDC — predictable, dollar-denominated.
            </p>
          </li>
          <li>
            <p className="text-sm font-medium uppercase tracking-wider text-muted">
              03
            </p>
            <p className="mt-1 text-lg font-medium">Unlock and deliver</p>
            <p className="mt-1 text-muted">
              arcdot. confirms payment and returns the response. Agents keep working.
            </p>
          </li>
        </ol>
      </section>

      <footer className="mt-28 border-t border-line/80 pt-8 text-sm text-muted">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-display text-lg text-foreground">arcdot.</span>
          <span>Settled in USDC on Arc</span>
        </div>
      </footer>
    </main>
  );
}
