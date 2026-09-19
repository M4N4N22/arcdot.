import Link from "next/link";
import { LiveUnlockStrip } from "@/components/LiveUnlockStrip";

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
              Connect in Cursor
            </Link>
            <Link
              href="/console"
              className="inline-flex h-11 items-center justify-center border border-line bg-surface/70 px-5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-surface"
            >
              Open console
            </Link>
          </div>
          <p className="mt-6 font-mono text-xs text-muted">
            MCP at <span className="text-foreground">POST /api/mcp</span>
            {" · "}
            Catalog at <span className="text-foreground">GET /api/services</span>
          </p>
        </div>
      </section>

      <section className="border-t border-line/80 bg-surface/40">
        <div
          className="animate-fade-up mx-auto w-full max-w-6xl px-6 py-20 md:py-28"
          style={{ animationDelay: "80ms" }}
        >
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            How agents unlock
          </h2>
          <p className="mt-3 max-w-lg text-muted">
            A machine-to-machine toll booth: discover the catalog, settle on
            Arc, unlock the reply.
          </p>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            <li>
              <p className="text-sm font-medium uppercase tracking-wider text-muted">
                01
              </p>
              <p className="mt-2 text-lg font-medium">Discover</p>
              <p className="mt-2 text-muted">
                Query the live catalog. Each service lists a price and seller.
              </p>
            </li>
            <li>
              <p className="text-sm font-medium uppercase tracking-wider text-muted">
                02
              </p>
              <p className="mt-2 text-lg font-medium">Pay on Arc</p>
              <p className="mt-2 text-muted">
                The agent wallet sends a tiny USDC payment — no middleman token.
              </p>
            </li>
            <li>
              <p className="text-sm font-medium uppercase tracking-wider text-muted">
                03
              </p>
              <p className="mt-2 text-lg font-medium">Unlock</p>
              <p className="mt-2 text-muted">
                arcdot. verifies settlement and returns the response in seconds.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <LiveUnlockStrip />

      <section className="border-t border-line/80">
        <div
          className="animate-fade-up mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-28"
          style={{ animationDelay: "140ms" }}
        >
          <div>
            <h2 className="font-display text-3xl tracking-tight">
              For builders
            </h2>
            <p className="mt-3 max-w-sm text-muted">
              Connect Cursor via the MCP Hub, publish in Studio, and let agents
              pay your endpoints without API keys.
            </p>
            <Link
              href="/hub"
              className="mt-6 inline-block text-sm font-medium underline underline-offset-4 transition-colors hover:text-muted"
            >
              Open MCP Hub
            </Link>
          </div>
          <div>
            <h2 className="font-display text-3xl tracking-tight">Live console</h2>
            <p className="mt-3 max-w-sm text-muted">
              Developer control on the left, sandbox agent loop on the right —
              built for demos and debugging.
            </p>
            <Link
              href="/console"
              className="mt-6 inline-block text-sm font-medium underline underline-offset-4 transition-colors hover:text-muted"
            >
              Open console
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line/80">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-muted">
          <span className="font-display text-lg text-foreground">arcdot.</span>
          <span>Settled in USDC on Arc</span>
        </div>
      </footer>
    </main>
  );
}
