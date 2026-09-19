"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/hub/CopyButton";
import { editorMcpConfig } from "@/lib/hub/mcpConfig";

type EditorMcpPanelProps = {
  origin: string;
};

/** Soft settings mock — MCP servers panel (local @arcdot/agent proxy). */
export function EditorMcpPanel({ origin }: EditorMcpPanelProps) {
  const config = editorMcpConfig(origin);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setPulse((p) => !p), 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span
          className={[
            "h-2 w-2 rounded-full bg-foreground/70 transition-opacity",
            pulse ? "opacity-100" : "opacity-40",
          ].join(" ")}
          aria-hidden
        />
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
          MCP · Servers
        </p>
      </div>

      <div className="grid gap-0 md:grid-cols-[7.5rem_1fr]">
        <aside className="hidden border-r border-line bg-surface-muted/60 px-3 py-4 md:block">
          <p className="rounded-lg px-2 py-1 text-[11px] text-muted">General</p>
          <p className="mt-1 rounded-lg px-2 py-1 text-[11px] text-muted">
            Models
          </p>
          <p className="mt-1 rounded-lg bg-foreground px-2 py-1 text-[11px] font-medium text-surface">
            MCP
          </p>
          <p className="mt-1 rounded-lg px-2 py-1 text-[11px] text-muted">
            Tools
          </p>
        </aside>

        <div className="space-y-4 px-4 py-4">
          <div>
            <p className="text-sm font-semibold tracking-tight">
              Installed servers
            </p>
            <p className="mt-1 text-xs text-muted">
              Local @arcdot/agent proxy auto-settles paid tools from your
              wallet.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface-muted/80 p-3.5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold">arcdot</p>
                <p className="mt-1 break-all font-mono text-[11px] text-muted">
                  npx @arcdot/agent mcp --origin …
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted ring-1 ring-line">
                <span
                  className="h-1.5 w-1.5 animate-pulse-line rounded-full bg-foreground"
                  aria-hidden
                />
                Ready
              </span>
            </div>
          </div>

          <CopyButton
            value={config}
            label="Copy mcp.json"
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
}
