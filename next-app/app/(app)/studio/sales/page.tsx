"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { buildSignedReadChallenge } from "@/lib/auth/signedReadChallenge";
import { formatUsdcWei, statusLabel } from "@/lib/format/usdc";
import type { RequestRow } from "@/lib/types/catalog";

export default function StudioSalesPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [sales, setSales] = useState<RequestRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const issuedAt = Math.floor(Date.now() / 1000);
      const challenge = buildSignedReadChallenge({
        purpose: "sales",
        address,
        issuedAt,
      });
      const signature = await signMessageAsync({ message: challenge });
      const qs = new URLSearchParams({
        address,
        signature,
        issuedAt: String(issuedAt),
      });
      const res = await fetch(`/api/studio/sales?${qs}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load sales");
        return;
      }
      setSales(data.sales ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load sales");
    } finally {
      setLoading(false);
    }
  }, [address, signMessageAsync]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isConnected) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 md:px-8">
        <ConnectButton />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      <Link href="/studio" className="text-sm text-muted hover:text-foreground">
        ← Studio
      </Link>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Sales</h1>
          <p className="mt-2 text-muted">Recent unlocks for your services.</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="h-10 border border-line bg-surface px-4 text-sm"
        >
          Refresh
        </button>
      </div>
      {loading && <p className="mt-10 text-muted">Confirm in wallet to load…</p>}
      {error && <p className="mt-10 text-sm text-red-700">{error}</p>}
      {!loading && !error && (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {sales.length === 0 && (
            <li className="py-8 text-muted">No sales yet.</li>
          )}
          {sales.map((s) => (
            <li key={s.id} className="py-5">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-medium">{s.service_slug ?? "Service"}</p>
                <p className="font-mono text-xs uppercase text-muted">
                  {statusLabel(s.status)}
                </p>
              </div>
              <p className="mt-1 text-xs text-muted">
                {new Date(s.created_at).toLocaleString()}
                {s.seller_amount_wei && (
                  <> · {formatUsdcWei(s.seller_amount_wei)} USDC to you</>
                )}
              </p>
              {s.prompt && (
                <p className="mt-2 text-sm text-muted line-clamp-2">{s.prompt}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
