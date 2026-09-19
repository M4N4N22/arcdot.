"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type LogLevel = "info" | "warn" | "ok" | "pay";

interface LogLine {
  id: string;
  level: LogLevel;
  text: string;
  at: string;
}

const DEMO_SCRIPT: Array<{ level: LogLevel; text: string; delay: number }> = [
  {
    level: "info",
    text: "Agent online — preparing a paid request…",
    delay: 400,
  },
  {
    level: "warn",
    text: "Access locked — a small payment is required to continue.",
    delay: 1200,
  },
  {
    level: "pay",
    text: "Sending 0.01 USDC checkout on Arc…",
    delay: 2200,
  },
  {
    level: "ok",
    text: "Payment confirmed. Unlocking the endpoint…",
    delay: 3600,
  },
  {
    level: "info",
    text: "Streaming reply from the model…",
    delay: 4400,
  },
  {
    level: "ok",
    text: "Done. Agent received a live answer and is moving on.",
    delay: 5600,
  },
];

export default function DashboardPage() {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const pushLine = useCallback((level: LogLevel, text: string) => {
    const at = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLines((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, level, text, at },
    ]);
  }, []);

  const runDemo = useCallback(() => {
    clearTimers();
    setLines([]);
    setRunning(true);

    DEMO_SCRIPT.forEach((step, index) => {
      const id = window.setTimeout(() => {
        pushLine(step.level, step.text);
        if (index === DEMO_SCRIPT.length - 1) setRunning(false);
      }, step.delay);
      timers.current.push(id);
    });
  }, [pushLine]);

  useEffect(() => {
    runDemo();
    return clearTimers;
  }, [runDemo]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="relative min-h-full bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 80% 0%, var(--glow), transparent 50%)",
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-2xl tracking-tight">
          arcdot.
        </Link>
        <button
          type="button"
          onClick={runDemo}
          disabled={running}
          className="h-10 border border-line bg-surface px-4 text-sm font-medium transition-opacity disabled:opacity-50"
        >
          {running ? "Running…" : "Replay demo"}
        </button>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="animate-fade-up max-w-xl">
          <h1 className="font-display text-4xl tracking-tight md:text-5xl">
            Activity
          </h1>
          <p className="mt-3 text-muted">
            Watch an agent run out of access, complete a tiny checkout, and
            finish its task.
          </p>
        </div>

        <div className="animate-fade-up mt-10 overflow-hidden border border-line bg-[#141414] text-[#e8e4dc] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-white/25 animate-pulse-line" />
            <span className="text-xs uppercase tracking-widest text-white/50">
              Live session
            </span>
          </div>
          <div className="h-[420px] overflow-y-auto px-4 py-4 font-mono text-sm leading-relaxed">
            {lines.length === 0 && (
              <p className="text-white/40">Waiting for the agent…</p>
            )}
            {lines.map((line) => (
              <div key={line.id} className="animate-log-in mb-3 flex gap-3">
                <span className="shrink-0 text-white/30">{line.at}</span>
                <span
                  className={
                    line.level === "ok"
                      ? "text-emerald-300"
                      : line.level === "warn"
                        ? "text-amber-200"
                        : line.level === "pay"
                          ? "text-white"
                          : "text-white/70"
                  }
                >
                  {line.text}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <p className="mt-6 max-w-lg text-sm text-muted">
          This console mirrors what you will see when a real paid request hits
          your gated endpoint — lock, checkout, unlock, reply.
        </p>
      </main>
    </div>
  );
}
