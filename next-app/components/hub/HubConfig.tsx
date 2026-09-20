"use client";

import { CopyButton } from "@/components/hub/CopyButton";
import { HubCodePanel } from "@/components/hub/HubCodePanel";
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
      title="Universal config"
      description="One schema for scripts, CI, SDKs, and custom clients. Copy once — point anything at your live arcdot. deployment."
    >
      <HubCodePanel
        title="schema"
        filename="arcdot-mcp-config.json"
        code={universalJson}
        accentCopy
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <CopyButton
          value={universalJson}
          label="Copy arcdot-mcp-config.json"
          variant="primary"
          className="h-10 rounded-none px-4 text-sm"
        />
        <CopyButton
          value={endpoint}
          label="Copy endpoint only"
          variant="soft"
          className="h-10 rounded-none px-4 text-sm"
        />
      </div>
    </HubShell>
  );
}
