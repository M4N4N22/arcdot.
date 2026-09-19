"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { promptGatewayAbi } from "@/lib/arc/constants";
import { ARC_CHAIN_ID } from "@/lib/types/gateway";
import type { RequestRow, ServiceRow } from "@/lib/types/catalog";

function formatUsdcWei(wei: bigint): string {
  const whole = wei / BigInt(10 ** 18);
  const frac = wei % BigInt(10 ** 18);
  const fracStr = frac.toString().padStart(18, "0").slice(0, 4);
  return `${whole}.${fracStr}`;
}

export default function StudioPage() {
  const { address, isConnected } = useAccount();
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
    const [sRes, salesRes] = await Promise.all([
      fetch(`/api/studio/services?address=${address}`),
      fetch(`/api/studio/sales?address=${address}`),
    ]);
    const sJson = await sRes.json();
    const salesJson = await salesRes.json();
    setServices(sJson.services ?? []);
    setSales(salesJson.sales ?? []);
  }, [address]);

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
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="font-display text-4xl tracking-tight">Studio</h1>
        <p className="mt-3 text-muted">
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

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-4">
      <div className="animate-fade-up max-w-xl">
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">
          Studio
        </h1>
        <p className="mt-3 text-muted">
          Your seller home — earnings, services, and recent sales.
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
          href="/studio/services"
          className="inline-flex h-11 items-center border border-line bg-surface px-5 text-sm"
        >
          All services
        </Link>
      </div>
    </main>
  );
}
