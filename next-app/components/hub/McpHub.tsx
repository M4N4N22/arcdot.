"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyButton } from "@/components/hub/CopyButton";
import { EditorMcpPanel } from "@/components/hub/EditorMcpPanel";
import { HubCodePanel } from "@/components/hub/HubCodePanel";
import {
  curlHandshakeSnippet,
  editorMcpConfig,
  langchainStyleSnippet,
  mcpEndpoint,
  pythonHttpSnippet,
  universalMcpConfig,
} from "@/lib/hub/mcpConfig";

const SECTIONS = [
  { id: "config", label: "Universal config" },
  { id: "editors", label: "IDEs & clients" },
  { id: "frameworks", label: "Frameworks" },
] as const;

type FrameworkTab = "python" | "agents" | "curl";

const PLACEHOLDER_ORIGIN = "https://your-app.vercel.app";

export function McpHub() {
  const [origin, setOrigin] = useState(PLACEHOLDER_ORIGIN);
  const [active, setActive] = useState<string>("config");
  const [frameworkTab, setFrameworkTab] = useState<FrameworkTab>("python");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean,
    ) as HTMLElement[];
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.4, 0.7] },
    );

    for (const n of nodes) observer.observe(n);
    return () => observer.disconnect();
  }, []);

  const endpoint = mcpEndpoint(origin);
  const editorJson = editorMcpConfig(origin);
  const universalJson = universalMcpConfig(origin);

  const frameworkCode =
    frameworkTab === "python"
      ? pythonHttpSnippet(origin)
      : frameworkTab === "agents"
        ? langchainStyleSnippet(origin)
        : curlHandshakeSnippet(origin);

  const frameworkMeta =
    frameworkTab === "python"
      ? { title: "python", filename: "arcdot_mcp_client.py" }
      : frameworkTab === "agents"
        ? { title: "agents", filename: "framework_injection.py" }
        : { title: "bash", filename: "handshake.sh" };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-5 md:px-6 md:pt-6">
      {/* Hero card */}
      <header className="animate-hub-rise overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-sm md:p-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Integration Hub
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">
          Connect any MCP client
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">
          Point editors, agent frameworks, or custom scripts at the arcdot. MCP
          server. Paid tools unlock with a few cents of USDC — no API keys.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <CopyButton
            value={endpoint}
            label="Copy MCP link"
            variant="primary"
            className="h-10 rounded-full px-5 text-sm"
          />
          <Link
            href="/docs/quickstart"
            className="inline-flex h-10 items-center rounded-full bg-[#efeeea] px-5 text-sm font-semibold text-foreground ring-1 ring-black/[0.04] transition-colors hover:bg-foreground hover:text-surface"
          >
            Get started
          </Link>
          <Link
            href="/docs"
            className="inline-flex h-10 items-center rounded-full border border-line bg-surface px-5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Documentation
          </Link>
        </div>

        <p className="mt-4 break-all font-mono text-[11px] text-muted">
          {endpoint}
        </p>
      </header>

      {/* Section pills */}
      <nav
        className="sticky top-0 z-20 mt-5 rounded-2xl border border-line bg-surface/95 p-1.5 shadow-sm backdrop-blur-sm"
        aria-label="Hub sections"
      >
        <ul className="flex gap-1 overflow-x-auto">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setActive(s.id)}
                  className={[
                    "inline-flex whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-foreground text-surface"
                      : "text-muted hover:bg-surface-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* §1 Universal config */}
      <section
        id="config"
        className="mt-5 scroll-mt-24 rounded-3xl border border-line bg-surface p-6 shadow-sm md:p-8"
      >
        <p className="font-mono text-[11px] text-muted">01</p>
        <h2 className="mt-1 font-display text-2xl tracking-tight">
          Universal config
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          One schema for scripts, CI, SDKs, and custom clients. Copy once —
          point anything at your live arcdot. deployment.
        </p>

        <div className="mt-6">
          <HubCodePanel
            title="schema"
            filename="arcdot-mcp-config.json"
            code={universalJson}
            accentCopy
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton
            value={universalJson}
            label="Copy arcdot-mcp-config.json"
            variant="primary"
            className="h-10 rounded-full px-4 text-sm"
          />
          <CopyButton
            value={endpoint}
            label="Copy endpoint only"
            variant="soft"
            className="h-10 rounded-full px-4 text-sm"
          />
        </div>
      </section>

      {/* §2 IDEs */}
      <section
        id="editors"
        className="mt-5 scroll-mt-24 rounded-3xl border border-line bg-surface p-6 shadow-sm md:p-8"
      >
        <p className="font-mono text-[11px] text-muted">02</p>
        <h2 className="mt-1 font-display text-2xl tracking-tight">
          IDEs &amp; clients
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Any MCP-capable editor or desktop client works the same way: add a
          server, paste the URL, reload tools.
        </p>
        <p className="mt-1.5 text-xs text-muted">
          Works with VS Code, Cursor, Claude Desktop, Windsurf, and other
          clients that speak MCP over HTTP.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <EditorMcpPanel origin={origin} />
          <div className="space-y-4">
            <ol className="space-y-2.5 rounded-2xl border border-line bg-surface-muted/50 p-4 text-sm text-muted">
              <li className="flex gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-[11px] font-semibold text-foreground ring-1 ring-line">
                  1
                </span>
                <span className="pt-0.5">
                  Open your client&apos;s{" "}
                  <span className="font-medium text-foreground">MCP</span>{" "}
                  settings
                </span>
              </li>
              <li className="flex gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-[11px] font-semibold text-foreground ring-1 ring-line">
                  2
                </span>
                <span className="pt-0.5">
                  Add a server named{" "}
                  <span className="font-medium text-foreground">arcdot</span>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-[11px] font-semibold text-foreground ring-1 ring-line">
                  3
                </span>
                <span className="pt-0.5">
                  Paste the URL (or drop the JSON into your MCP config file)
                </span>
              </li>
            </ol>
            <HubCodePanel
              title="mcp config"
              filename="mcp.json"
              code={editorJson}
              accentCopy
            />
          </div>
        </div>
      </section>

      {/* §3 Frameworks */}
      <section
        id="frameworks"
        className="mt-5 scroll-mt-24 rounded-3xl border border-line bg-surface p-6 shadow-sm md:p-8"
      >
        <p className="font-mono text-[11px] text-muted">03</p>
        <h2 className="mt-1 font-display text-2xl tracking-tight">
          Agent frameworks
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Hook autonomous runners into the same node — list tools, call them,
          settle when payment is needed, then continue.
        </p>

        <div
          className="mt-5 flex flex-wrap gap-1 rounded-2xl border border-line bg-surface-muted/60 p-1"
          role="tablist"
          aria-label="Framework snippets"
        >
          {(
            [
              { id: "python" as const, label: "Python HTTP" },
              { id: "agents" as const, label: "LangChain / CrewAI" },
              { id: "curl" as const, label: "curl handshake" },
            ] as const
          ).map((tab) => {
            const selected = frameworkTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setFrameworkTab(tab.id)}
                className={[
                  "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                  selected
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted hover:text-foreground",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <HubCodePanel
            title={frameworkMeta.title}
            filename={frameworkMeta.filename}
            code={frameworkCode}
          />
        </div>

        <p className="mt-4 text-sm text-muted">
          Free tools like catalog listing work immediately. Paid tools ask for
          settlement first — then return the result on retry.
        </p>
      </section>

      {/* Continue */}
      <footer className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/docs"
          className="group rounded-2xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            Documentation
          </p>
          <p className="mt-1 text-sm font-semibold group-hover:underline group-hover:underline-offset-4">
            See docs
          </p>
          <p className="mt-1 text-xs text-muted">
            Guides, API shapes, and payment on Arc.
          </p>
        </Link>
        <Link
          href="/services"
          className="group rounded-2xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            Explore
          </p>
          <p className="mt-1 text-sm font-semibold group-hover:underline group-hover:underline-offset-4">
            Browse tools
          </p>
          <p className="mt-1 text-xs text-muted">
            See what&apos;s live on the network.
          </p>
        </Link>
        <Link
          href="/create"
          className="group rounded-2xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-1"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            Studio
          </p>
          <p className="mt-1 text-sm font-semibold group-hover:underline group-hover:underline-offset-4">
            Publish a tool
          </p>
          <p className="mt-1 text-xs text-muted">
            List your endpoint and earn USDC.
          </p>
        </Link>
      </footer>
    </div>
  );
}
