import Link from "next/link";
import { DocsPager } from "@/components/docs/DocsPager";
import { AGENT_GITHUB_URL } from "@/lib/agent/install";

export const metadata = {
  title: "Overview",
};

const cards = [
  {
    href: "/docs/agents/client",
    title: "Install buyer client",
    body: "GitHub-only @arcdot/agent — wallet, auto-settle, MCP proxy.",
  },
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
    <article
      id="docs-article"
      className="animate-fade-up w-full max-w-3xl py-10 md:py-12"
    >
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        Documentation
      </p>
      <h1 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
        arcdot. docs
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted md:text-[17px]">
        Pay-as-you-go API access on Arc. Agents discover gated services, settle
        tiny native USDC payments, and unlock replies — no accounts, no invoices.
      </p>

      <ol className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { n: "01", t: "Discover", d: "Catalog & well-known" },
          { n: "02", t: "Pay", d: "Native USDC on Arc" },
          { n: "03", t: "Unlock", d: "POST /api/gateway" },
        ].map((s) => (
          <li
            key={s.n}
            className="rounded-xl border border-line bg-surface/60 px-4 py-4"
          >
            <p className="font-mono text-xs text-muted">{s.n}</p>
            <p className="mt-2 font-medium text-foreground">{s.t}</p>
            <p className="mt-1 text-sm text-muted">{s.d}</p>
          </li>
        ))}
      </ol>

      <ul className="mt-12 divide-y divide-line border-y border-line">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="group flex flex-col gap-1 py-5 transition-colors sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div>
                <p className="text-lg font-medium text-foreground group-hover:underline group-hover:underline-offset-4">
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
        Source:{" "}
        <a
          href={AGENT_GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          GitHub
        </a>
        {" · "}
        Prefer a live demo? Open the{" "}
        <Link href="/console" className="underline underline-offset-4">
          Console
        </Link>
        .
      </p>

      <div className="mt-12 border-t border-line pt-6">
        <DocsPager pathname="/docs" />
      </div>
    </article>
  );
}
