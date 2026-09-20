"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyButton } from "@/components/hub/CopyButton";
import { EditorMcpPanel } from "@/components/hub/EditorMcpPanel";
import { HubCodePanel } from "@/components/hub/HubCodePanel";
import {
  AGENT_GITHUB_URL,
  AGENT_NPM_PACKAGE,
  agentInstallCommands,
} from "@/lib/agent/install";
import {
  curlHandshakeSnippet,
  editorMcpConfig,
  langchainStyleSnippet,
  mcpEndpoint,
  pythonHttpSnippet,
  universalMcpConfig,
} from "@/lib/hub/mcpConfig";

const SECTIONS = [
  { id: "install", label: "Install" },
  { id: "config", label: "Universal config" },
  { id: "wallet", label: "Agent wallet" },
  { id: "editors", label: "IDEs & clients" },
  { id: "frameworks", label: "Frameworks" },
] as const;

type FrameworkTab = "python" | "agents" | "curl";

const PLACEHOLDER_ORIGIN = "https://your-app.vercel.app";

export function McpHub() {
  const [origin, setOrigin] = useState(PLACEHOLDER_ORIGIN);
  const [active, setActive] = useState<string>("install");
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
          Point editors and frameworks at arcdot. with{" "}
          <span className="font-medium text-foreground">@arcdot/agent</span>{" "}
          from npm — local wallet, auto-settle, no API keys on our
          server.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <CopyButton
            value={agentInstallCommands.npxWalletCreate}
            label="Copy install"
            variant="primary"
            className="h-10 rounded-full px-5 text-sm"
          />
          <CopyButton
            value={endpoint}
            label="Copy MCP link"
            variant="soft"
            className="h-10 rounded-full px-5 text-sm"
          />
          <Link
            href="/docs/agents/client"
            className="inline-flex h-10 items-center rounded-full bg-[#efeeea] px-5 text-sm font-semibold text-foreground ring-1 ring-black/[0.04] transition-colors hover:bg-foreground hover:text-surface"
          >
            Install guide
          </Link>
          <a
            href={AGENT_GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-full border border-line bg-surface px-5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            GitHub
          </a>
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

      {/* §0 Install */}
      <section
        id="install"
        className="mt-5 scroll-mt-24 rounded-3xl border border-line bg-surface p-6 shadow-sm md:p-8"
      >
        <p className="font-mono text-[11px] text-muted">01</p>
        <h2 className="mt-1 font-display text-2xl tracking-tight">
          Install buyer client
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Distributed from npm. One command creates a local wallet — no clone
          required for day-to-day use.
        </p>

        <div className="mt-6">
          <HubCodePanel
            title="bash"
            filename="install.sh"
            code={`# Create wallet\n${agentInstallCommands.npxWalletCreate}\n\n# Add as a dependency\n${agentInstallCommands.npmInstall}\n\n# Package: ${AGENT_NPM_PACKAGE}`}
            accentCopy
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton
            value={agentInstallCommands.npxWalletCreate}
            label="Copy wallet create"
            variant="primary"
            className="h-10 rounded-full px-4 text-sm"
          />
          <CopyButton
            value={agentInstallCommands.npmInstall}
            label="Copy npm install"
            variant="soft"
            className="h-10 rounded-full px-4 text-sm"
          />
          <Link
            href="/docs/agents/client"
            className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Full install docs
          </Link>
        </div>
      </section>

      {/* §1 Universal config */}
      <section
        id="config"
        className="mt-5 scroll-mt-24 rounded-3xl border border-line bg-surface p-6 shadow-sm md:p-8"
      >
        <p className="font-mono text-[11px] text-muted">02</p>
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

      {/* §2 Agent wallet */}
      <section
        id="wallet"
        className="mt-5 scroll-mt-24 rounded-3xl border border-line bg-surface p-6 shadow-sm md:p-8"
      >
        <p className="font-mono text-[11px] text-muted">03</p>
        <h2 className="mt-1 font-display text-2xl tracking-tight">
          Give your agent a wallet
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          No repo clone. Install from npm, fund a local wallet, then connect
          via the MCP proxy — arcdot. never holds your key.
        </p>

        <ol className="mt-6 space-y-3">
          {[
            {
              n: "1",
              title: "Create a wallet (one command)",
              body: `${agentInstallCommands.npxWalletCreate} — saves to ~/.arcdot/wallet.json on your machine.`,
            },
            {
              n: "2",
              title: "Fund it with USDC on Arc",
              body: "Send native USDC (18 decimals) to that address on Arc Mainnet (chain 5042). Only fund what you’re willing to spend.",
            },
            {
              n: "3",
              title: "Connect with the local MCP proxy",
              body: "Paste the Cursor JSON below. The proxy auto-settles paid tools from your wallet — no manual pay step.",
            },
            {
              n: "4",
              title: "Or unlock from scripts / LangChain",
              body: `${agentInstallCommands.npxUnlock("…")} — or import createArcdotAgent from @arcdot/agent.`,
            },
          ].map((step) => (
            <li
              key={step.n}
              className="flex gap-3 rounded-2xl border border-line bg-surface-muted/40 p-4"
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-[11px] font-semibold text-foreground ring-1 ring-line">
                {step.n}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5">
          <HubCodePanel
            title="bash"
            filename="wallet.sh"
            code={`# anywhere — no clone\n${agentInstallCommands.npxWalletCreate}\n\n# after funding\n${agentInstallCommands.npxUnlock(origin)}`}
            accentCopy
          />
        </div>

        <p className="mt-4 text-xs text-muted">
          Package: {AGENT_NPM_PACKAGE}. Keys stay in ~/.arcdot or
          ARCDOT_PRIVATE_KEY on the buyer host only.
        </p>
      </section>

      {/* §3 IDEs */}
      <section
        id="editors"
        className="mt-5 scroll-mt-24 rounded-3xl border border-line bg-surface p-6 shadow-sm md:p-8"
      >
        <p className="font-mono text-[11px] text-muted">04</p>
        <h2 className="mt-1 font-display text-2xl tracking-tight">
          IDEs &amp; clients
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Use the <span className="font-medium text-foreground">local proxy</span>{" "}
          — not a raw remote MCP URL. Cursor talks to{" "}
          <code className="font-mono text-[11px] text-foreground">
            @arcdot/agent mcp
          </code>
          , which settles paid calls from your wallet.
        </p>
        <p className="mt-1.5 text-xs text-muted">
          Works with VS Code, Cursor, Claude Desktop, Windsurf, and other
          clients that support stdio MCP.
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
                  Run the{" "}
                  <span className="font-medium text-foreground">
                    npm install
                  </span>{" "}
                  wallet command and fund the address
                </span>
              </li>
              <li className="flex gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-[11px] font-semibold text-foreground ring-1 ring-line">
                  2
                </span>
                <span className="pt-0.5">
                  Open your client&apos;s{" "}
                  <span className="font-medium text-foreground">MCP</span>{" "}
                  settings
                </span>
              </li>
              <li className="flex gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-[11px] font-semibold text-foreground ring-1 ring-line">
                  3
                </span>
                <span className="pt-0.5">
                  Paste the proxy JSON (npx runs the local settle proxy)
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
        <p className="font-mono text-[11px] text-muted">05</p>
        <h2 className="mt-1 font-display text-2xl tracking-tight">
          Agent frameworks
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Hook autonomous runners into the same node — list tools, call them,
          settle from the agent&apos;s wallet when payment is needed, then
          continue.
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
          Free tools like catalog listing work immediately. Paid tools
          auto-settle through @arcdot/agent (proxy or SDK).
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
