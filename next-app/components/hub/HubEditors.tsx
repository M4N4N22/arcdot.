"use client";

import Link from "next/link";
import { EditorMcpPanel } from "@/components/hub/EditorMcpPanel";
import { HubCodePanel } from "@/components/hub/HubCodePanel";
import {
  HubCallout,
  HubContinue,
  HubH2,
  HubP,
} from "@/components/hub/HubProse";
import { HubShell } from "@/components/hub/HubShell";
import { useHubOrigin } from "@/components/hub/useHubOrigin";
import { editorMcpConfig } from "@/lib/hub/mcpConfig";

export function HubEditors() {
  const origin = useHubOrigin();
  const editorJson = editorMcpConfig(origin);

  return (
    <HubShell
      showBack
      wide
      title="Connect IDE"
      description="Paste the local MCP proxy — your IDE talks to @arcdot/agent, which pays from your wallet. Not the raw /api/mcp URL."
    >
      <HubCallout title="Before this step">
        You need a funded agent wallet.{" "}
        <Link href="/hub">Create</Link> → <Link href="/fund">Fund</Link>.
        Without USDC on Arc, unlocks will ask you to top up.
      </HubCallout>

      <HubH2>1. Copy this config</HubH2>
      <HubP>
        Works with Cursor, VS Code, Claude Desktop, Windsurf, and other stdio
        MCP clients. <code>npx</code> runs the buyer client — no project{" "}
        <code>npm install</code>.
      </HubP>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <EditorMcpPanel origin={origin} />
        <div>
          <ol className="mb-2 list-decimal space-y-2 pl-5 text-[15px] text-muted">
            <li>
              Confirm balance on{" "}
              <Link
                href="/fund"
                className="text-foreground underline underline-offset-4"
              >
                /fund
              </Link>
            </li>
            <li>Open your client’s MCP settings</li>
            <li>Paste the JSON below and enable the server</li>
            <li>
              In chat: discover → unlock (proxy settles when funded)
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

      <HubH2>2. What not to do</HubH2>
      <HubP>
        Pointing the IDE at remote <code>/api/mcp</code> alone can list tools,
        but it <strong className="font-medium text-foreground">cannot</strong>{" "}
        auto-pay — keys stay on your machine via this proxy.
      </HubP>

      <HubContinue
        links={[
          {
            href: "/hub",
            title: "Get started",
            description: "Create wallet if you skipped it.",
          },
          {
            href: "/fund",
            title: "Fund",
            description: "Top up when unlock says balance is low.",
          },
          {
            href: "/hub/frameworks",
            title: "Frameworks",
            description: "LangChain / scripts — where npm install belongs.",
          },
        ]}
      />
    </HubShell>
  );
}
