"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/hub/CopyButton";
import { HubCodePanel } from "@/components/hub/HubCodePanel";
import { mcpEndpoint } from "@/lib/hub/mcpConfig";

type CursorSettingsMockProps = {
  origin: string;
};

export function CursorSettingsMock({ origin }: CursorSettingsMockProps) {
  const url = mcpEndpoint(origin);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setPulse((p) => !p), 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="border border-line bg-surface/80">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
        <span
          className={[
            "h-2 w-2 rounded-full bg-foreground/70 transition-opacity",
            pulse ? "opacity-100" : "opacity-40",
          ].join(" ")}
          aria-hidden
        />
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
          Cursor · MCP Servers
        </p>
      </div>

      <div className="grid gap-0 md:grid-cols-[7.5rem_1fr]">
        <aside className="hidden border-r border-line bg-foreground/[0.02] px-3 py-4 md:block">
          <p className="text-[11px] text-muted">General</p>
          <p className="mt-3 text-[11px] text-muted">Models</p>
          <p className="mt-3 text-[11px] font-medium text-foreground">MCP</p>
          <p className="mt-3 text-[11px] text-muted">Rules</p>
        </aside>

        <div className="space-y-4 px-4 py-4">
          <div>
            <p className="text-sm font-medium">Installed servers</p>
            <p className="mt-1 text-xs text-muted">
              Add arcdot. so your assistant can discover and unlock paid tools.
            </p>
          </div>

          <div className="border border-line bg-background/60 p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-medium">arcdot</p>
                <p className="mt-1 break-all font-mono text-[11px] text-muted">
                  {url}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                <span
                  className="h-1.5 w-1.5 animate-pulse-line bg-foreground"
                  aria-hidden
                />
                Ready
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyButton value={url} label="Copy server URL" variant="primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
