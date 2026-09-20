"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { UsdcOnArcMark, UsdcOnArcPrice } from "@/components/brand/UsdcOnArcMark";
import { buildUpdateChallenge } from "@/lib/auth/updateServiceChallenge";
import type { ServiceRow } from "@/lib/types/catalog";

export default function StudioServicesPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address) return;
    const res = await fetch(`/api/studio/services?address=${address}`);
    const data = await res.json();
    setServices(data.services ?? []);
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  async function togglePause(service: ServiceRow) {
    if (!address) return;
    setBusySlug(service.slug);
    setError(null);
    try {
      const issuedAt = Math.floor(Date.now() / 1000);
      const paused = !service.paused;
      const challenge = buildUpdateChallenge({
        slug: service.slug,
        owner_address: address,
        issuedAt,
        paused,
      });
      const signature = await signMessageAsync({ message: challenge });
      const res = await fetch(`/api/services/${service.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paused,
          owner_address: address,
          signature,
          issuedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update");
        return;
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusySlug(null);
    }
  }

  if (!isConnected) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 md:px-8">
        <p className="text-muted">Connect to manage your tools.</p>
        <div className="mt-4">
          <ConnectButton />
        </div>
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
          <h1 className="mt-3 font-display text-3xl tracking-tight">Your tools</h1>
          <p className="mt-2 text-muted">
            Pause, edit, or open a listing. Prices are in USDC on Arc.
          </p>
        </div>
        <Link
          href="/create"
          className="h-10 bg-accent px-4 text-sm font-medium text-surface inline-flex items-center"
        >
          Publish
        </Link>
      </div>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {services.length === 0 && (
          <li className="py-8 text-muted">
            No tools yet.{" "}
            <Link href="/create" className="underline underline-offset-4">
              Publish your first
            </Link>
            .
          </li>
        )}
        {services.map((s) => (
          <li
            key={s.id}
            className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">
                {s.title}{" "}
                {s.paused && (
                  <span className="text-xs uppercase tracking-wider text-amber-800">
                    Paused
                  </span>
                )}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted">
                <UsdcOnArcPrice amount={s.price_usdc} withMark />
                <span>· /{s.slug}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/studio/services/${s.slug}/edit`}
                className="h-9 border border-line bg-surface px-3 text-sm inline-flex items-center"
              >
                Edit
              </Link>
              <Link
                href={`/services/${s.slug}`}
                className="h-9 border border-line bg-surface px-3 text-sm inline-flex items-center"
              >
                View
              </Link>
              <button
                type="button"
                disabled={busySlug === s.slug}
                onClick={() => void togglePause(s)}
                className="h-9 border border-line bg-surface px-3 text-sm disabled:opacity-50"
              >
                {s.paused ? "Resume" : "Pause"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
