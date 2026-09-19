"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import {
  ensureSignedReadSession,
  signedReadQuery,
} from "@/lib/auth/signedReadSession";
import { statusLabel } from "@/lib/format/usdc";
import type { RequestRow } from "@/lib/types/catalog";

export default function ActivityPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          setRequests([]);
          return;
        }
        setNeedsUnlock(false);
        const res = await fetch(`/api/me/requests?${signedReadQuery(session)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not load activity");
          return;
        }
        setRequests(data.requests ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load activity",
        );
      } finally {
        setLoading(false);
      }
    },
    [address, signMessageAsync],
  );

  // Prefer cached session on mount — no wallet popup unless user unlocks
  useEffect(() => {
    void load({ prompt: false });
  }, [load]);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl animate-fade-up">
          <h1 className="font-display text-3xl tracking-tight md:text-4xl">
            Activity
          </h1>
          <p className="mt-2 text-muted">
            Your recent paid unlocks — checkout, delivery, and reply previews.
          </p>
        </div>
        {isConnected && (
          <button
            type="button"
            onClick={() => void load({ prompt: true })}
            className="h-10 border border-line bg-surface px-4 text-sm"
          >
            {needsUnlock ? "Unlock activity" : "Refresh"}
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
      ) : needsUnlock ? (
        <div className="mt-12 flex flex-col items-start gap-3">
          <p className="text-muted">
            Confirm once in your wallet to view private activity. We won’t ask
            again for about an hour while you browse.
          </p>
          <button
            type="button"
            onClick={() => void load({ prompt: true })}
            className="h-11 bg-accent px-5 text-sm font-medium text-surface"
          >
            Unlock activity
          </button>
        </div>
      ) : error ? (
        <p className="mt-12 text-sm text-red-700">{error}</p>
      ) : requests.length === 0 ? (
        <p className="mt-12 text-muted">
          No requests yet.{" "}
          <Link href="/services" className="underline underline-offset-4">
            Try a service
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
                  {statusLabel(r.status)}
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
                        Payment confirmation
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
