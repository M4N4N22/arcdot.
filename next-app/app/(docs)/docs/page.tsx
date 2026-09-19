import Link from "next/link";
import { DocsPager } from "@/components/docs/DocsPager";

export const metadata = {
  title: "Overview",
};

const cards = [
  {
    href: "/hub",
    title: "MCP Hub",
    body: "Wire any MCP client — editors, frameworks, or scripts — with one-click configs.",
  },
  {
    href: "/docs/quickstart",
    title: "Quickstart",
    body: "Hit the live catalog and unlock a service in minutes.",
  },
  {
    href: "/docs/agents",
    title: "For agents",
    body: "Discover → pay on Arc → unlock over HTTP. No API keys.",
  },
  {
    href: "/docs/sellers",
    title: "For sellers",
    body: "Publish a gated endpoint in Studio and earn USDC.",
  },
  {
    href: "/docs/api/catalog",
    title: "API reference",
    body: "Catalog, unlock, x402 negotiation, and error shapes.",
  },
] as const;

export default function DocsHubPage() {
  return (
    <div className="animate-fade-up mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        Documentation
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
        arcdot. docs
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
        Pay-as-you-go API access on Arc. Agents discover gated services, settle
        tiny native USDC payments, and unlock replies — no accounts, no invoices.
      </p>

      <ol className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { n: "01", t: "Discover", d: "Catalog & well-known" },
          { n: "02", t: "Pay", d: "Native USDC on Arc" },
          { n: "03", t: "Unlock", d: "POST /api/gateway" },
        ].map((s) => (
          <li key={s.n} className="border border-line bg-surface/60 px-4 py-4">
            <p className="font-mono text-xs text-muted">{s.n}</p>
            <p className="mt-2 font-medium">{s.t}</p>
            <p className="mt-1 text-sm text-muted">{s.d}</p>
          </li>
        ))}
      </ol>

      <ul className="mt-12 divide-y divide-line border-y border-line">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="group flex flex-col gap-1 py-6 transition-colors sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div>
                <p className="text-lg font-medium group-hover:underline group-hover:underline-offset-4">
                  {c.title}
                </p>
                <p className="mt-1 text-muted">{c.body}</p>
              </div>
              <span className="shrink-0 text-sm text-muted">Read →</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-muted">
        Prefer a live demo? Open the{" "}
        <Link href="/console" className="underline underline-offset-4">
          Console
        </Link>
        .
      </p>

      <DocsPager pathname="/docs" />
    </div>
  );
}
