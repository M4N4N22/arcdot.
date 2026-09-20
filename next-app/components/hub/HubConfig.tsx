"use client";

import Link from "next/link";
import { CopyButton } from "@/components/hub/CopyButton";
import { HubCodePanel } from "@/components/hub/HubCodePanel";
import {
  HubCallout,
  HubContinue,
  HubH2,
  HubP,
} from "@/components/hub/HubProse";
import { HubShell } from "@/components/hub/HubShell";
import { useHubOrigin } from "@/components/hub/useHubOrigin";
import { mcpEndpoint, universalMcpConfig } from "@/lib/hub/mcpConfig";

export function HubConfig() {
  const origin = useHubOrigin();
  const endpoint = mcpEndpoint(origin);
  const universalJson = universalMcpConfig(origin);

  return (
    <HubShell
      showBack
      title="Advanced"
      description="Machine-readable descriptor for custom clients. Most people should use Get started → Connect IDE instead."
    >
      <HubCallout title="Skip this for IDE chat">
        IDE auto-pay needs the local proxy from{" "}
        <Link href="/hub/editors">Connect IDE</Link>. This JSON describes the
        remote host for scripts and registries.
      </HubCallout>

      <HubH2>Universal descriptor</HubH2>
      <HubP>
        Remote endpoint (discover / 402 only — no auto-settle by itself):{" "}
        <code className="break-all">{endpoint}</code>
      </HubP>
      <HubCodePanel
        title="schema"
        filename="arcdot-mcp-config.json"
        code={universalJson}
        accentCopy
      />
      <div className="flex flex-wrap gap-2">
        <CopyButton
          value={universalJson}
          label="Copy config"
          variant="primary"
          className="h-9 rounded-lg px-4 text-sm"
        />
        <CopyButton
          value={endpoint}
          label="Copy endpoint"
          variant="soft"
          className="h-9 rounded-lg px-4 text-sm"
        />
      </div>

      <HubContinue
        links={[
          {
            href: "/hub/editors",
            title: "Connect IDE",
            description: "Stdio MCP proxy for your IDE.",
          },
          {
            href: "/hub",
            title: "Get started",
            description: "Create → fund → connect.",
          },
        ]}
      />
    </HubShell>
  );
}
