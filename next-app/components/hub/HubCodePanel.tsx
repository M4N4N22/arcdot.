"use client";

import { CopyButton } from "@/components/hub/CopyButton";

type HubCodePanelProps = {
  title: string;
  code: string;
  filename?: string;
  accentCopy?: boolean;
};

/** Dark code panel — matches docs CodeBlock chrome. */
export function HubCodePanel({
  title,
  code,
  filename,
  accentCopy = false,
}: HubCodePanelProps) {
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-line bg-[#141414]">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {title}
            {filename ? ` · ${filename}` : ""}
          </p>
        </div>
        <CopyButton
          value={code}
          label="Copy"
          variant={accentCopy ? "soft" : "dark"}
          className="h-7 shrink-0 rounded-md px-2.5 text-[11px]"
        />
      </div>
      <pre className="max-h-[22rem] overflow-auto p-4 font-mono text-[12px] leading-relaxed text-zinc-300 whitespace-pre">
        {code}
      </pre>
    </div>
  );
}
