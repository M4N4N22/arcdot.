"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyButton } from "@/components/hub/CopyButton";
import { CursorSettingsMock } from "@/components/hub/CursorSettingsMock";
import { HubCodePanel } from "@/components/hub/HubCodePanel";
import {
  curlHandshakeSnippet,
  cursorMcpConfig,
  langchainStyleSnippet,
  mcpEndpoint,
  pythonHttpSnippet,
  universalMcpConfig,
} from "@/lib/hub/mcpConfig";

const SECTIONS = [
  { id: "cursor", label: "Cursor / VS Code" },
  { id: "frameworks", label: "Frameworks" },
  { id: "config", label: "Universal config" },
] as const;

type FrameworkTab = "python" | "agents" | "curl";

const PLACEHOLDER_ORIGIN = "https://your-app.vercel.app";

export function McpHub() {
  const [origin, setOrigin] = useState(PLACEHOLDER_ORIGIN);
  const [active, setActive] = useState<string>("cursor");
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
  const cursorJson = cursorMcpConfig(origin);
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
    <div className="mx-auto w-full max-w-4xl px-6 pb-20 pt-6 md:px-8 md:pt-8">
      {/* Hero — brand + one job */}
      <header className="animate-hub-rise max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Integration Hub
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
          Connect your assistant
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
          Pull the arcdot. MCP server into Cursor, VS Code, or any agent
          framework. Your tools unlock with a few cents of USDC — no API keys.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <CopyButton
            value={endpoint}
            label="Copy MCP link"
            variant="primary"
            className="h-10 px-4 text-sm"
          />
          <p className="font-mono text-xs text-muted break-all">{endpoint}</p>
        </div>
      </header>

      {/* Sticky section nav */}
      <nav
        className="sticky top-0 z-20 -mx-6 mt-10 border-y border-line bg-background/90 px-6 backdrop-blur-sm md:-mx-8 md:px-8"
        aria-label="Hub sections"
      >
        <ul className="flex gap-1 overflow-x-auto py-2">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setActive(s.id)}
                  className={[
                    "inline-flex whitespace-nowrap px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-foreground/[0.07] font-medium text-foreground"
                      : "text-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* §1 Cursor */}
      <section
        id="cursor"
        className="animate-fade-up scroll-mt-24 border-b border-line py-12 md:py-14"
        style={{ animationDelay: "60ms" }}
      >
        <p className="font-mono text-xs text-muted">01</p>
        <h2 className="mt-2 font-display text-2xl tracking-tight md:text-3xl">
          Cursor &amp; VS Code
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          Paste the live serverless MCP link into your editor settings. Your
          coding assistant immediately gets catalog discovery and paid tools.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <CursorSettingsMock origin={origin} />
          <div className="space-y-3">
            <ol className="space-y-3 text-sm text-muted">
              <li className="flex gap-3">
                <span className="font-mono text-xs text-foreground">1</span>
                <span>
                  Open Cursor Settings →{" "}
                  <span className="font-medium text-foreground">MCP</span>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-foreground">2</span>
                <span>
                  Add a new server named{" "}
                  <span className="font-medium text-foreground">arcdot</span>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-foreground">3</span>
                <span>
                  Paste the URL below (or drop the JSON into your MCP config
                  file)
                </span>
              </li>
            </ol>
            <HubCodePanel
              title="mcp config"
              filename="mcp.json"
              code={cursorJson}
              accentCopy
            />
          </div>
        </div>
      </section>

      {/* §2 Frameworks */}
      <section
        id="frameworks"
        className="animate-fade-up scroll-mt-24 border-b border-line py-12 md:py-14"
        style={{ animationDelay: "100ms" }}
      >
        <p className="font-mono text-xs text-muted">02</p>
        <h2 className="mt-2 font-display text-2xl tracking-tight md:text-3xl">
          Agent frameworks
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          Hook autonomous runners into the same node — list tools, call them,
          settle when payment is needed, then continue.
        </p>

        <div
          className="mt-6 flex flex-wrap gap-1 border border-line bg-surface/50 p-1"
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
                  "px-3 py-2 text-sm transition-colors",
                  selected
                    ? "bg-background font-medium text-foreground shadow-sm"
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

      {/* §3 Universal config */}
      <section
        id="config"
        className="animate-fade-up scroll-mt-24 py-12 md:py-14"
        style={{ animationDelay: "140ms" }}
      >
        <p className="font-mono text-xs text-muted">03</p>
        <h2 className="mt-2 font-display text-2xl tracking-tight md:text-3xl">
          Universal config
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          One schema for scripts, CI, and custom clients. Copy once — point
          anything at your live arcdot. deployment.
        </p>

        <div className="mt-8">
          <HubCodePanel
            title="schema"
            filename="arcdot-mcp-config.json"
            code={universalJson}
            accentCopy
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <CopyButton
            value={universalJson}
            label="Copy arcdot-mcp-config.json"
            variant="primary"
            className="h-10 px-4 text-sm"
          />
          <CopyButton
            value={endpoint}
            label="Copy endpoint only"
            variant="ghost"
            className="h-10 px-4 text-sm"
          />
        </div>
      </section>

      {/* Outbound links only — do not embed other pillars */}
      <footer className="border-t border-line pt-10">
        <p className="text-sm text-muted">Continue</p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          <li>
            <Link
              href="/services"
              className="group flex items-baseline justify-between gap-4 py-5 transition-colors"
            >
              <div>
                <p className="font-medium group-hover:underline group-hover:underline-offset-4">
                  Browse live tools
                </p>
                <p className="mt-1 text-sm text-muted">
                  See what&apos;s published on the network right now.
                </p>
              </div>
              <span className="shrink-0 text-sm text-muted">→</span>
            </Link>
          </li>
          <li>
            <Link
              href="/studio"
              className="group flex items-baseline justify-between gap-4 py-5 transition-colors"
            >
              <div>
                <p className="font-medium group-hover:underline group-hover:underline-offset-4">
                  Publish a tool
                </p>
                <p className="mt-1 text-sm text-muted">
                  List your endpoint in Studio and start earning USDC.
                </p>
              </div>
              <span className="shrink-0 text-sm text-muted">→</span>
            </Link>
          </li>
          <li>
            <Link
              href="/docs/mcp"
              className="group flex items-baseline justify-between gap-4 py-5 transition-colors"
            >
              <div>
                <p className="font-medium group-hover:underline group-hover:underline-offset-4">
                  Protocol reference
                </p>
                <p className="mt-1 text-sm text-muted">
                  Full MCP methods, payment fields, and error shapes.
                </p>
              </div>
              <span className="shrink-0 text-sm text-muted">→</span>
            </Link>
          </li>
        </ul>
      </footer>
    </div>
  );
}
