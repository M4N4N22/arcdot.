"use client";

import { CopyButton } from "@/components/hub/CopyButton";

type HubCodePanelProps = {
  title: string;
  code: string;
  filename?: string;
  accentCopy?: boolean;
};

export function HubCodePanel({
  title,
  code,
  filename,
  accentCopy = false,
}: HubCodePanelProps) {
  return (
    <div className="overflow-hidden border border-line bg-[#141414] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
            {title}
          </p>
          {filename && (
            <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-400">
              {filename}
            </p>
          )}
        </div>
        <CopyButton
          value={code}
          label="Copy"
          variant={accentCopy ? "primary" : "dark"}
          className="shrink-0"
        />
      </div>
      <pre className="max-h-[22rem] overflow-auto p-4 font-mono text-[11px] leading-relaxed text-zinc-300 whitespace-pre md:text-[12px]">
        {code}
      </pre>
    </div>
  );
}
