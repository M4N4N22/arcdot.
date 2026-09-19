import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-full overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, var(--glow), transparent 55%), linear-gradient(180deg, #ece8e0 0%, var(--background) 40%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl tracking-tight">arcdot.</span>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <Link href="/dashboard" className="transition-colors hover:text-foreground">
            Activity
          </Link>
          <a
            href="#how"
            className="transition-colors hover:text-foreground"
          >
            How it works
          </a>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col px-6 pb-24 pt-10 md:pt-16">
        <section className="animate-fade-up max-w-2xl">
          <p className="mb-4 font-display text-5xl leading-none tracking-tight md:text-7xl">
            arcdot.
          </p>
          <h1 className="max-w-xl text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
            Tiny payments. Instant API access for agents.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
            Gate your models and data behind a few cents of USDC. Agents pay,
            unlock, and keep working — no accounts, no invoices.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center bg-accent px-5 text-sm font-medium text-surface transition-opacity hover:opacity-90"
            >
              Watch a live run
            </Link>
            <a
              href="#how"
              className="inline-flex h-11 items-center justify-center border border-line bg-surface/60 px-5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-surface"
            >
              See how it works
            </a>
          </div>
        </section>

        <section
          id="how"
          className="animate-fade-up mt-28 max-w-2xl"
          style={{ animationDelay: "120ms" }}
        >
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            Three steps. No friction.
          </h2>
          <p className="mt-3 text-muted">
            Built for autonomous clients that need to buy a single answer and
            move on.
          </p>
          <ol className="mt-10 space-y-8 border-l border-line pl-6">
            <li>
              <p className="text-sm font-medium uppercase tracking-wider text-muted">
                01
              </p>
              <p className="mt-1 text-lg font-medium">Pay a few cents</p>
              <p className="mt-1 text-muted">
                Your agent sends a tiny USDC payment on Arc — predictable costs,
                settled in dollars.
              </p>
            </li>
            <li>
              <p className="text-sm font-medium uppercase tracking-wider text-muted">
                02
              </p>
              <p className="mt-1 text-lg font-medium">Unlock the endpoint</p>
              <p className="mt-1 text-muted">
                arcdot. confirms the payment and opens the gate for that
                request.
              </p>
            </li>
            <li>
              <p className="text-sm font-medium uppercase tracking-wider text-muted">
                03
              </p>
              <p className="mt-1 text-lg font-medium">Get the answer</p>
              <p className="mt-1 text-muted">
                The response streams back. Your agent continues its job without
                waiting on a human.
              </p>
            </li>
          </ol>
        </section>

        <section
          className="animate-fade-up mt-28"
          style={{ animationDelay: "200ms" }}
        >
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            For builders who ship APIs.
          </h2>
          <p className="mt-3 max-w-lg text-muted">
            Monetize specialized models and data without standing up billing
            software. One checkout, every request.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
          >
            Open the activity console
            <span aria-hidden>→</span>
          </Link>
        </section>
      </main>

      <footer className="relative z-10 border-t border-line/80 px-6 py-8 text-sm text-muted">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <span className="font-display text-lg text-foreground">arcdot.</span>
          <span>Settled in USDC on Arc</span>
        </div>
      </footer>
    </div>
  );
}
