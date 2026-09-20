"use client";

import { useState } from "react";
import { HubCodePanel } from "@/components/hub/HubCodePanel";
import { HubShell } from "@/components/hub/HubShell";
import { useHubOrigin } from "@/components/hub/useHubOrigin";
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
      title="Agent frameworks"
      description="Hook autonomous runners into the same node — list tools, call them, settle from the agent’s wallet when payment is needed, then continue."
    >
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
                "inline-flex h-10 items-center px-4 text-sm transition-colors",
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

      <div className="mt-6">
        <HubCodePanel
          title={frameworkMeta.title}
          filename={frameworkMeta.filename}
          code={frameworkCode}
        />
      </div>

      <p className="mt-4 text-sm text-muted">
        Free tools like catalog listing work immediately. Paid tools auto-settle
        through @arcdot/agent (proxy or SDK).
      </p>
    </HubShell>
  );
}
