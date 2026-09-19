"use client";

import { useState } from "react";

export function CodeBlock({
  code,
  title,
}: {
  code: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-line bg-[#141414]">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-3 py-2">
        <span className="truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {title ?? "Example"}
        </span>
        <button
          type="button"
          onClick={() => void onCopy()}
          className="shrink-0 text-[11px] text-zinc-400 transition-colors hover:text-zinc-100"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-zinc-300 whitespace-pre">
        {code}
      </pre>
    </div>
  );
}
