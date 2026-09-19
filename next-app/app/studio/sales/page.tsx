"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import type { RequestRow } from "@/lib/types/catalog";

export default function StudioSalesPage() {
  const { address, isConnected } = useAccount();
  const [sales, setSales] = useState<RequestRow[]>([]);

  const load = useCallback(async () => {
    if (!address) return;
    const res = await fetch(`/api/studio/sales?address=${address}`);
    const data = await res.json();
    setSales(data.sales ?? []);
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isConnected) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <ConnectButton />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-4">
      <Link href="/studio" className="text-sm text-muted hover:text-foreground">
        ← Studio
      </Link>
      <h1 className="mt-6 font-display text-4xl tracking-tight">Sales</h1>
      <p className="mt-2 text-muted">Recent unlocks for your services.</p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {sales.length === 0 && (
          <li className="py-8 text-muted">No sales yet.</li>
        )}
        {sales.map((s) => (
          <li key={s.id} className="py-5">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-medium">{s.service_slug ?? "Service"}</p>
              <p className="font-mono text-xs uppercase text-muted">{s.status}</p>
            </div>
            <p className="mt-1 text-xs text-muted">
              {new Date(s.created_at).toLocaleString()}
              {s.amount_wei && (
                <> · {s.seller_amount_wei ?? s.amount_wei} wei to you</>
              )}
            </p>
            {s.prompt && (
              <p className="mt-2 text-sm text-muted line-clamp-2">{s.prompt}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
