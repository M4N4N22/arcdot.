"use client";

import { useCallback, useEffect, useState } from "react";

type Phase = "idle" | "discover" | "pay" | "unlock" | "done" | "unavailable";

type LogLine = { text: string; key: number };

export function LiveUnlockStrip() {
  const [enabled, setEnabled] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/health");
        const data = (await res.json()) as { demoUnlock?: boolean };
        if (!cancelled && data.demoUnlock) setEnabled(true);
      } catch {
        // hide strip when health fails
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pushLog = useCallback((text: string) => {
    setLogs((prev) => [...prev.slice(-5), { text, key: Date.now() + Math.random() }]);
  }, []);

  const run = useCallback(async () => {
    setBusy(true);
    setAnswer(null);
    setLogs([]);
    setPhase("discover");
    pushLog("Discovering catalog…");

    try {
      const catalogRes = await fetch("/api/services");
      if (!catalogRes.ok) throw new Error("catalog");
      pushLog("Catalog ready. Starting checkout…");
      setPhase("pay");

      const res = await fetch("/api/demo/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            "In two short sentences, explain why tiny USDC payments help agents buy API access.",
        }),
      });

      if (!res.ok || !res.body) {
        setPhase("unavailable");
        pushLog("Live unlock is not available right now.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";
        for (const chunk of chunks) {
          const line = chunk.trim();
          if (!line.startsWith("data:")) continue;
          try {
            const event = JSON.parse(line.slice(5).trim()) as {
              type: string;
              text?: string;
              level?: string;
            };
            if (event.type === "log" && event.text) {
              if (event.level === "pay") setPhase("pay");
              if (event.level === "ok" || event.text.toLowerCase().includes("unlock")) {
                setPhase("unlock");
              }
              pushLog(event.text);
            }
            if (event.type === "answer" && event.text) {
              setAnswer(event.text);
              setPhase("done");
            }
            if (event.type === "error" && event.text) {
              pushLog(event.text);
              setPhase("unavailable");
            }
          } catch {
            // skip malformed
          }
        }
      }
      if (!answer) setPhase((p) => (p === "unavailable" ? p : "done"));
    } catch {
      setPhase("unavailable");
      pushLog("Could not run the live unlock.");
    } finally {
      setBusy(false);
    }
  }, [pushLog]);

  if (!enabled) return null;

  const phases: { id: Phase; label: string }[] = [
    { id: "discover", label: "Discover" },
    { id: "pay", label: "Pay" },
    { id: "unlock", label: "Unlock" },
    { id: "done", label: "Reply" },
  ];

  const phaseOrder = ["discover", "pay", "unlock", "done"] as const;
  const currentIdx = phaseOrder.indexOf(
    phase === "idle" || phase === "unavailable" ? "discover" : (phase as (typeof phaseOrder)[number]),
  );

  return (
    <section className="border-t border-line/80 bg-surface/50">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-lg">
            <h2 className="font-display text-3xl tracking-tight">Live unlock</h2>
            <p className="mt-2 text-muted">
              Watch the agent loop: discover, pay, unlock — without leaving the
              page.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run()}
            className="h-11 bg-accent px-5 text-sm font-medium text-surface disabled:opacity-50"
          >
            {busy ? "Running…" : phase === "idle" ? "Run live unlock" : "Run again"}
          </button>
        </div>

        <ol className="mt-8 flex flex-wrap gap-2 text-xs uppercase tracking-wider text-muted">
          {phases.map((p, i) => {
            const active =
              phase !== "idle" &&
              phase !== "unavailable" &&
              currentIdx >= i;
            return (
              <li
                key={p.id}
                className={[
                  "border border-line px-3 py-1.5",
                  active ? "text-foreground bg-foreground/[0.05]" : "bg-surface/60",
                ].join(" ")}
              >
                {p.label}
              </li>
            );
          })}
        </ol>

        <ul className="mt-6 max-w-2xl space-y-2 font-mono text-xs text-muted">
          {logs.length === 0 && phase === "idle" && (
            <li>
              Press run for a quick preview, or open the{" "}
              <a href="/console" className="underline underline-offset-2">
                full console
              </a>
              .
            </li>
          )}
          {logs.map((l) => (
            <li key={l.key} className="animate-log-in">
              {l.text}
            </li>
          ))}
        </ul>

        {answer && (
          <div className="mt-6 max-w-2xl border border-line bg-surface p-5 text-sm leading-relaxed">
            {answer}
          </div>
        )}
      </div>
    </section>
  );
}
