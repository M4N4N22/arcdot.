"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { UsdcOnArcMark, UsdcOnArcPrice } from "@/components/brand/UsdcOnArcMark";
import {
  ensureSignedReadSession,
  signedReadQuery,
} from "@/lib/auth/signedReadSession";
import { isRehearsalRequest } from "@/lib/catalog/requests";
import { formatUsdcWei, statusLabel } from "@/lib/format/usdc";
import type { RequestRow } from "@/lib/types/catalog";

export default function StudioSalesPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [sales, setSales] = useState<RequestRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(false);

  const load = useCallback(
    async (opts?: { prompt?: boolean }) => {
      if (!address) return;
      setLoading(true);
      setError(null);
      try {
        const session = await ensureSignedReadSession({
          address,
          signMessageAsync,
          silent: opts?.prompt === false,
        });
        if (!session) {
          setNeedsUnlock(true);
          setSales([]);
          return;
        }
        setNeedsUnlock(false);
        const res = await fetch(`/api/studio/sales?${signedReadQuery(session)}`);
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
    },
    [address, signMessageAsync],
  );

  useEffect(() => {
    void load({ prompt: false });
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
          <UsdcOnArcMark size="sm" />
          <h1 className="mt-3 font-display text-3xl tracking-tight">Sales</h1>
          <p className="mt-2 text-muted">
            Paid unlocks credit withdrawable USDC on Arc. Rehearsal unlocks do
            not.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load({ prompt: true })}
          className="h-10 border border-line bg-surface px-4 text-sm"
        >
          {needsUnlock ? "Unlock sales" : "Refresh"}
        </button>
      </div>
      {loading && <p className="mt-10 text-muted">Loading…</p>}
      {!loading && needsUnlock && (
        <div className="mt-10 flex flex-col items-start gap-3">
          <p className="text-muted">
            Confirm once in your wallet to view sales. One signature covers
            Studio sales for about an hour.
          </p>
          <button
            type="button"
            onClick={() => void load({ prompt: true })}
            className="h-11 bg-accent px-5 text-sm font-medium text-surface"
          >
            Unlock sales
          </button>
        </div>
      )}
      {error && <p className="mt-10 text-sm text-red-700">{error}</p>}
      {!loading && !needsUnlock && !error && (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {sales.length === 0 && (
            <li className="py-8 text-muted">No sales yet.</li>
          )}
          {sales.map((s) => {
            const rehearsal = isRehearsalRequest(s);
            return (
              <li key={s.id} className="py-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-medium">{s.service_slug ?? "Service"}</p>
                  <p className="font-mono text-xs uppercase text-muted">
                    {rehearsal ? "Rehearsal" : statusLabel(s.status)}
                  </p>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                  <span>{new Date(s.created_at).toLocaleString()}</span>
                  {rehearsal ? (
                    <span>· no withdrawable credit</span>
                  ) : s.seller_amount_wei ? (
                    <>
                      <span>·</span>
                      <UsdcOnArcPrice
                        amount={formatUsdcWei(s.seller_amount_wei)}
                        withMark
                        className="text-xs"
                      />
                      <span>to you</span>
                    </>
                  ) : null}
                </p>
                {s.prompt && (
                  <p className="mt-2 text-sm text-muted line-clamp-2">
                    {s.prompt}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
