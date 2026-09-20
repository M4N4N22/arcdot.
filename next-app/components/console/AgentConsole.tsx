"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type CatalogService = {
  slug: string;
  title: string;
  description: string;
  price_usdc: string;
  price_wei: string;
  seller: string;
  seller_name?: string | null;
};

type Telemetry = {
  ok: boolean;
  chainId: number;
  gateway: string | null;
  demoUnlock?: boolean;
  pendingPlatformUsdc: string | null;
  verifiedRequests: number | null;
  blockNumber: string | null;
  minFeeUsdc: string;
};

type LogLine = {
  key: number;
  ts?: string;
  level: string;
  text: string;
};

function levelTone(level: string) {
  if (level === "ok") return "text-emerald-300";
  if (level === "pay") return "text-amber-200";
  if (level === "warn" || level === "fail") return "text-rose-300";
  return "text-zinc-400";
}

export function AgentConsole() {
  const [services, setServices] = useState<CatalogService[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [prompt, setPrompt] = useState(
    "Summarize why agents need tiny USDC on Arc payments for API access.",
  );
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catRes, telRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/telemetry"),
        ]);
        const cat = await catRes.json();
        const tel = await telRes.json();
        if (cancelled) return;
        const list = (cat.services ?? []) as CatalogService[];
        setServices(list);
        if (list.length) setSelected(list[0].slug);
        setTelemetry(tel as Telemetry);
      } catch {
        if (!cancelled) setError("Could not load console data.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const service = useMemo(
    () => services.find((s) => s.slug === selected) ?? null,
    [services, selected],
  );

  const snippet = useMemo(() => {
    const slug = service?.slug ?? "quick-brief";
    const price = service?.price_usdc ?? "0.01";
    return `# 1) Discover
curl -s $BASE/.well-known/arcdot.json | jq .
curl -s $BASE/api/services | jq '.services[] | {slug,price_usdc,seller}'

# 2) Pay on Arc (USDC on Arc, 18 decimals) then unlock
# On 402: read PAYMENT-REQUIRED (base64) or error.payment
# Headers after settlement:
#   X-Arc-Tx-Hash, X-Arc-Address, X-Arc-Signature (EIP-191)

curl -s -X POST $BASE/api/gateway \\
  -H "Content-Type: application/json" \\
  -H "X-Arc-Tx-Hash: 0x…" \\
  -H "X-Arc-Address: 0x…" \\
  -H "X-Arc-Signature: 0x…" \\
  -d '{"service":"${slug}","input":{"prompt":"…"},"auth":{"issuedAt":0,"expiresAt":0}}'

# Or (buyer client — no clone):
#   npx --yes @arcdot/agent wallet create
#   # or: npx --yes @arcdot/agent wallet import --key 0x…
#   npx --yes @arcdot/agent unlock --origin $BASE --service ${slug} --prompt "…"
# Price for selected service: ${price} USDC on Arc`;
  }, [service]);

  const runSandbox = useCallback(async () => {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setAnswer(null);
    setLogs([]);

    try {
      const res = await fetch("/api/demo/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: selected, prompt }),
      });

      if (res.status === 503) {
        const body = await res.json().catch(() => ({}));
        setError(
          (body as { error?: string }).error ||
            "Sandbox unlock is not configured on this server.",
        );
        return;
      }

      if (!res.ok || !res.body) {
        setError("Sandbox could not start.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          try {
            const event = JSON.parse(line.slice(5).trim()) as {
              type: string;
              text?: string;
              level?: string;
              ts?: string;
              mock?: boolean;
            };
            if (event.type === "log" && event.text) {
              const text = event.text;
              setLogs((prev) => [
                ...prev,
                {
                  key: Date.now() + Math.random(),
                  ts: event.ts,
                  level: event.level ?? "info",
                  text,
                },
              ]);
            }
            if (event.type === "answer" && event.text) {
              setAnswer(event.text);
            }
            if (event.type === "error" && event.text) {
              setError(event.text);
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      setError("Sandbox connection failed.");
    } finally {
      setBusy(false);
    }
  }, [prompt, selected]);

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] flex-col lg:min-h-[calc(100svh-4rem)] lg:flex-row">
      {/* Left — control */}
      <aside className="flex w-full flex-col border-b border-line bg-surface/80 lg:w-[min(26rem,38%)] lg:border-b-0 lg:border-r">
        <div className="border-b border-line px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Developer console
          </p>
          <h1 className="mt-1 font-display text-2xl tracking-tight">
            Agent control
          </h1>
          <p className="mt-1 text-sm text-muted">
            Configure a gated service, then run the sandbox loop on the right.
          </p>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <section>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Services
            </p>
            <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto border border-line">
              {services.length === 0 && (
                <li className="px-3 py-4 text-sm text-muted">Loading catalog…</li>
              )}
              {services.map((s) => (
                <li key={s.slug}>
                  <button
                    type="button"
                    onClick={() => setSelected(s.slug)}
                    className={[
                      "w-full px-3 py-2.5 text-left text-sm transition-colors",
                      selected === s.slug
                        ? "bg-foreground text-surface"
                        : "hover:bg-foreground/[0.04]",
                    ].join(" ")}
                  >
                    <span className="font-medium">{s.title}</span>
                    <span className="mt-0.5 block font-mono text-[11px] opacity-70">
                      {s.slug}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Tariff
            </p>
            <p className="mt-2 font-mono text-2xl tracking-tight">
              {service?.price_usdc ?? "—"}{" "}
              <span className="text-base text-muted">USDC on Arc / request</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              USDC on Arc — machine-readable in the catalog as{" "}
              <span className="font-mono">price_wei</span>.
            </p>
          </section>

          <section>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Contract telemetry
            </p>
            <dl className="mt-3 space-y-2 border border-line bg-background/50 p-3 font-mono text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Network</dt>
                <dd>Arc {telemetry?.chainId ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Checkout</dt>
                <dd className="truncate">
                  {telemetry?.gateway
                    ? `${telemetry.gateway.slice(0, 6)}…${telemetry.gateway.slice(-4)}`
                    : "Not configured"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Platform accrued</dt>
                <dd>
                  {telemetry?.pendingPlatformUsdc != null
                    ? `${Number(telemetry.pendingPlatformUsdc).toFixed(4)} USDC on Arc`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Verified unlocks</dt>
                <dd>{telemetry?.verifiedRequests ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Block</dt>
                <dd>{telemetry?.blockNumber ?? "—"}</dd>
              </div>
            </dl>
          </section>

          <section>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Agent recipe
              </p>
              <Link
                href="/docs"
                className="text-xs underline underline-offset-2 text-muted hover:text-foreground"
              >
                Full docs
              </Link>
            </div>
            <pre className="mt-3 overflow-x-auto border border-line bg-[#141414] p-3 font-mono text-[10px] leading-relaxed text-zinc-300">
              {snippet}
            </pre>
          </section>

          <section>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">
              Sandbox prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="mt-2 w-full border border-line bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </section>
        </div>
      </aside>

      {/* Right — terminal */}
      <section className="flex min-h-[28rem] flex-1 flex-col bg-[#0e0e0e] text-zinc-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-5 py-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Sandbox terminal
            </p>
            <p className="text-sm text-zinc-400">
              Simulated agent loop — same unlock path as production agents
            </p>
          </div>
          <button
            type="button"
            disabled={busy || !selected || telemetry?.demoUnlock === false}
            onClick={() => void runSandbox()}
            className="h-10 bg-zinc-100 px-4 text-sm font-medium text-zinc-900 disabled:opacity-40"
          >
            {busy ? "Running…" : "Trigger simulation agent"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 font-mono text-xs leading-relaxed">
          {logs.length === 0 && !error && (
            <p className="text-zinc-600">
              Press Trigger to stream Discover → payment needed → settle → unlock
              → reply.
            </p>
          )}
          {logs.map((l) => (
            <p key={l.key} className="animate-log-in py-0.5">
              <span className="text-zinc-600">
                [{l.ts ?? "--:--:--"}]
              </span>{" "}
              <span className={levelTone(l.level)}>
                {l.level.toUpperCase().padEnd(4)}
              </span>{" "}
              <span className="text-zinc-300">{l.text}</span>
            </p>
          ))}
          {error && <p className="mt-3 text-rose-300">{error}</p>}
          {answer && (
            <div className="mt-4 border border-zinc-700 bg-zinc-900/80 p-4 text-[12px] leading-relaxed text-zinc-200 whitespace-pre-wrap">
              {answer}
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800 px-5 py-3 text-[11px] text-zinc-500">
          Production agents use real Arc deposits via{" "}
          <span className="text-zinc-300">npm run agent:pay</span>. See{" "}
          <Link href="/docs" className="underline underline-offset-2">
            Documentation
          </Link>
          .
        </div>
      </section>
    </div>
  );
}
