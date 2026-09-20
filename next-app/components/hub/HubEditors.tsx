"use client";

import { EditorMcpPanel } from "@/components/hub/EditorMcpPanel";
import { HubCodePanel } from "@/components/hub/HubCodePanel";
import { HubShell } from "@/components/hub/HubShell";
import { useHubOrigin } from "@/components/hub/useHubOrigin";
import { editorMcpConfig } from "@/lib/hub/mcpConfig";

const STEPS = [
  "Run the npm install wallet command and fund the address",
  "Open your client’s MCP settings",
  "Paste the proxy JSON (npx runs the local settle proxy)",
] as const;

export function HubEditors() {
  const origin = useHubOrigin();
  const editorJson = editorMcpConfig(origin);

  return (
    <HubShell
      showBack
      title="IDEs & clients"
      description="Use the local proxy — not a raw remote MCP URL. Cursor talks to @arcdot/agent mcp, which settles paid calls from your wallet."
    >
      <p className="max-w-xl text-sm text-muted">
        Works with VS Code, Cursor, Claude Desktop, Windsurf, and other clients
        that support stdio MCP.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <EditorMcpPanel origin={origin} />
        <div className="space-y-6">
          <ol className="divide-y divide-line border-y border-line text-sm text-muted">
            {STEPS.map((text, i) => (
              <li key={text} className="flex gap-4 py-4">
                <span className="font-mono text-foreground">{i + 1}</span>
                <span>{text}</span>
              </li>
            ))}
          </ol>
          <HubCodePanel
            title="mcp config"
            filename="mcp.json"
            code={editorJson}
            accentCopy
          />
        </div>
      </div>
    </HubShell>
  );
}
