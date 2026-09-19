"use client";

import { useState } from "react";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  variant?: "primary" | "ghost" | "dark";
  className?: string;
};

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  variant = "ghost",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  const styles =
    variant === "primary"
      ? "bg-accent text-surface hover:opacity-90"
      : variant === "dark"
        ? "border border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500 hover:text-white"
        : "border border-line bg-surface text-foreground hover:bg-foreground/[0.04]";

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className={[
        "inline-flex h-9 items-center justify-center px-3 text-xs font-medium transition-all",
        styles,
        copied ? "scale-[0.98]" : "",
        className,
      ].join(" ")}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
