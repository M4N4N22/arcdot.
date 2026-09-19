"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useSignMessage,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { buildSignedReadChallenge } from "@/lib/auth/signedReadChallenge";
import { promptGatewayAbi } from "@/lib/arc/constants";
import { formatUsdcWei, statusLabel } from "@/lib/format/usdc";
import { ARC_CHAIN_ID } from "@/lib/types/gateway";
import type { RequestRow, ServiceRow } from "@/lib/types/catalog";

export default function StudioPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [sales, setSales] = useState<RequestRow[]>([]);
  const gateway = (process.env.NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS ||
    "") as `0x${string}`;

  const { data: pending, refetch } = useReadContract({
    address: gateway?.length === 42 ? gateway : undefined,
    abi: promptGatewayAbi,
    functionName: "pendingSeller",
    args: address ? [address] : undefined,
    chainId: ARC_CHAIN_ID,
    query: { enabled: Boolean(address && gateway?.length === 42) },
  });

  const { writeContractAsync, data: withdrawHash, isPending } =
    useWriteContract();
  const { isSuccess: withdrawn } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  const load = useCallback(async () => {
    if (!address) return;
    const sRes = await fetch(`/api/studio/services?address=${address}`);
    const sJson = await sRes.json();
    setServices(sJson.services ?? []);

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
      const salesRes = await fetch(`/api/studio/sales?${qs}`);
      const salesJson = await salesRes.json();
      setSales(salesJson.sales ?? []);
    } catch {
      setSales([]);
    }
  }, [address, signMessageAsync]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (withdrawn) void refetch();
  }, [withdrawn, refetch]);

  async function onWithdraw() {
    if (!gateway || gateway.length !== 42) return;
    await writeContractAsync({
      address: gateway,
      abi: promptGatewayAbi,
      functionName: "withdrawSeller",
      chainId: ARC_CHAIN_ID,
    });
  }

  if (!isConnected) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 md:px-8">
        <h1 className="font-display text-3xl tracking-tight">Studio</h1>
        <p className="mt-2 text-muted">
          Connect your wallet to manage services and withdraw earnings.
        </p>
        <div className="mt-6">
          <ConnectButton />
        </div>
      </main>
    );
  }

  const pendingWei = typeof pending === "bigint" ? pending : BigInt(0);
  const fulfilled = sales.filter((s) => s.status === "fulfilled").length;
  const recent = sales.slice(0, 5);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      <div className="animate-fade-up max-w-xl">
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          Studio
        </h1>
        <p className="mt-2 text-muted">
          Your seller home — earnings, services, and recent sales.
        </p>
        <p className="mt-3 font-mono text-xs text-muted">
          Agents discover your listings at{" "}
          <span className="text-foreground">/api/services</span>
        </p>
      </div>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        <div className="border border-line bg-surface p-5">
          <p className="text-xs uppercase tracking-wider text-muted">
            Available to withdraw
          </p>
          <p className="mt-2 font-mono text-2xl">
            {formatUsdcWei(pendingWei)} USDC
          </p>
          <button
            type="button"
            disabled={isPending || pendingWei === BigInt(0) || !gateway}
            onClick={() => void onWithdraw()}
            className="mt-4 h-10 bg-accent px-4 text-sm font-medium text-surface disabled:opacity-40"
          >
            {isPending ? "Confirm in wallet…" : "Withdraw"}
          </button>
        </div>
        <div className="border border-line bg-surface p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Services</p>
          <p className="mt-2 font-mono text-2xl">{services.length}</p>
          <Link
            href="/studio/services"
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            Manage services
          </Link>
        </div>
        <div className="border border-line bg-surface p-5">
          <p className="text-xs uppercase tracking-wider text-muted">
            Completed sales
          </p>
          <p className="mt-2 font-mono text-2xl">{fulfilled}</p>
          <Link
            href="/studio/sales"
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            View sales
          </Link>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/create"
          className="inline-flex h-11 items-center bg-accent px-5 text-sm font-medium text-surface"
        >
          Create a service
        </Link>
        <Link
          href="/studio/profile"
          className="inline-flex h-11 items-center border border-line bg-surface px-5 text-sm"
        >
          Edit profile
        </Link>
        <Link
          href={`/u/${address}`}
          className="inline-flex h-11 items-center border border-line bg-surface px-5 text-sm"
        >
          Public page
        </Link>
      </div>

      {recent.length > 0 && (
        <section className="mt-14">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
            Recent sales
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {recent.map((s) => (
              <li key={s.id} className="flex flex-wrap justify-between gap-2 py-4">
                <p className="font-medium">{s.service_slug ?? "Service"}</p>
                <p className="font-mono text-xs text-muted">
                  {statusLabel(s.status)}
                  {s.seller_amount_wei
                    ? ` · ${formatUsdcWei(s.seller_amount_wei)} USDC`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
