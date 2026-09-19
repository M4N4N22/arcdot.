"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import type { RequestRow } from "@/lib/types/catalog";

export default function ActivityPage() {
  const { address, isConnected } = useAccount();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/me/requests?address=${encodeURIComponent(address)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load activity");
        return;
      }
      setRequests(data.requests ?? []);
    } catch {
      setError("Could not load activity");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl animate-fade-up">
          <h1 className="font-display text-4xl tracking-tight md:text-5xl">
            Activity
          </h1>
          <p className="mt-3 text-muted">
            Your recent paid unlocks — checkout, delivery, and reply previews.
          </p>
        </div>
        {isConnected && (
          <button
            type="button"
            onClick={() => void load()}
            className="h-10 border border-line bg-surface px-4 text-sm"
          >
            Refresh
          </button>
        )}
      </div>

      {!isConnected ? (
        <div className="mt-12 flex flex-col items-start gap-3">
          <p className="text-muted">Connect your wallet to see your history.</p>
          <ConnectButton />
        </div>
      ) : loading ? (
        <p className="mt-12 text-muted">Loading…</p>
      ) : error ? (
        <p className="mt-12 text-sm text-red-700">{error}</p>
      ) : requests.length === 0 ? (
        <p className="mt-12 text-muted">
          No requests yet.{" "}
          <Link href="/services" className="underline underline-offset-4">
            Browse services
          </Link>{" "}
          and unlock one.
        </p>
      ) : (
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {requests.map((r) => (
            <li key={r.id} className="py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">
                  {r.service_slug ? (
                    <Link
                      href={`/services/${r.service_slug}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {r.service_slug}
                    </Link>
                  ) : (
                    "Service"
                  )}
                </p>
                <p className="font-mono text-xs uppercase tracking-wider text-muted">
                  {r.status}
                </p>
              </div>
              <p className="mt-1 text-xs text-muted">
                {new Date(r.created_at).toLocaleString()}
                {r.tx_hash &&
                  r.tx_hash !==
                    "0x0000000000000000000000000000000000000000000000000000000000000000" && (
                    <>
                      {" · "}
                      <a
                        href={`https://explorer.arc.io/tx/${r.tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-2"
                      >
                        Payment
                      </a>
                    </>
                  )}
              </p>
              {r.prompt && (
                <p className="mt-3 text-sm text-muted line-clamp-2">{r.prompt}</p>
              )}
              {r.response_preview && (
                <p className="mt-2 text-sm leading-relaxed line-clamp-3">
                  {r.response_preview}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
