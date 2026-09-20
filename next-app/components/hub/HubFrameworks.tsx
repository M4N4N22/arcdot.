"use client";

import Link from "next/link";
import { useState } from "react";
import { HubCodePanel } from "@/components/hub/HubCodePanel";
import {
  HubCallout,
  HubContinue,
  HubH2,
  HubP,
} from "@/components/hub/HubProse";
import { HubShell } from "@/components/hub/HubShell";
import { useHubOrigin } from "@/components/hub/useHubOrigin";
import { agentInstallCommands } from "@/lib/agent/install";
import {
  curlHandshakeSnippet,
  langchainStyleSnippet,
  pythonHttpSnippet,
} from "@/lib/hub/mcpConfig";

type FrameworkTab = "python" | "agents" | "curl";

const TABS = [
  { id: "python" as const, label: "Python HTTP" },
  { id: "agents" as const, label: "LangChain / CrewAI" },
  { id: "curl" as const, label: "curl handshake" },
] as const;

export function HubFrameworks() {
  const origin = useHubOrigin();
  const [frameworkTab, setFrameworkTab] = useState<FrameworkTab>("python");

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
    <HubShell
      showBack
      title="Frameworks"
      description="For code and agents that import @arcdot/agent — not required for IDE MCP chat."
    >
      <HubCallout title="When you need this">
        Use Frameworks if you <code>import</code> the SDK or run custom loops.
        For IDE chat only, stay on{" "}
        <Link href="/hub">Get started</Link> → <Link href="/fund">Fund</Link> →{" "}
        <Link href="/hub/editors">Connect IDE</Link>.
      </HubCallout>

      <HubH2>1. Install the SDK in your project</HubH2>
      <HubP>
        This is the only place <code>npm install</code> is required. Same local
        wallet file as the MCP proxy (<code>~/.arcdot/wallet.json</code>).
      </HubP>
      <HubCodePanel
        title="bash"
        filename="sdk.sh"
        code={`# create or import + fund first if needed\n${agentInstallCommands.npxWalletCreate}\n# or: ${agentInstallCommands.npxWalletImport}\n# then in your app:\n${agentInstallCommands.npmInstall}`}
        accentCopy
      />

      <HubH2>2. Snippets</HubH2>
      <HubP>
        Discover is free. Unlock settles from your funded agent wallet via the
        SDK.
      </HubP>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Framework snippets"
      >
        {TABS.map((tab) => {
          const selected = frameworkTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFrameworkTab(tab.id)}
              className={[
                "inline-flex h-9 items-center rounded-lg px-4 text-sm transition-colors",
                selected
                  ? "bg-foreground font-medium text-surface"
                  : "border border-line bg-surface text-muted hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <HubCodePanel
        title={frameworkMeta.title}
        filename={frameworkMeta.filename}
        code={frameworkCode}
        accentCopy
      />

      <HubContinue
        links={[
          {
            href: "/fund",
            title: "Fund",
            description: "Top up before unlock loops.",
          },
          {
            href: "/hub/editors",
            title: "Connect IDE",
            description: "IDE MCP path without npm install.",
          },
          {
            href: "/docs/agents/client",
            title: "Agent client docs",
            description: "SDK unlock and callMcpTool.",
          },
        ]}
      />
    </HubShell>
  );
}
