"use client";

import { WalletConnect } from "@/components/wallet/WalletConnect";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useSignMessage,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { UsdcOnArcMark, UsdcOnArcPrice } from "@/components/brand/UsdcOnArcMark";
import {
  ensureSignedReadSession,
  signedReadQuery,
} from "@/lib/auth/signedReadSession";
import {
  isOnChainSale,
  isRehearsalRequest,
} from "@/lib/catalog/requests";
import { ARC, promptGatewayAbi } from "@/lib/arc/constants";
import { formatUsdcWei, statusLabel } from "@/lib/format/usdc";
import {
  networkFeePercent,
  sellerKeepPercent,
} from "@/lib/studio/fees";
import type { RequestRow, ServiceRow } from "@/lib/types/catalog";

const QUICK_LINKS = [
  { href: "/create", label: "Publish" },
  { href: "/studio/services", label: "Your tools" },
  { href: "/studio/sales", label: "Sales" },
  { href: "/studio/profile", label: "Profile" },
] as const;

export default function StudioPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [sales, setSales] = useState<RequestRow[]>([]);
  const gateway = ARC.gatewayAddress;

  const gatewayAddr =
    gateway && gateway.length === 42 ? gateway : undefined;

  const { data: pending, refetch, isError: pendingError } = useReadContract({
    address: gatewayAddr,
    abi: promptGatewayAbi,
    functionName: "pendingSeller",
    args: address ? [address] : undefined,
    chainId: ARC.chainId,
    query: { enabled: Boolean(address && gatewayAddr) },
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

    const session = await ensureSignedReadSession({
      address,
      signMessageAsync,
      silent: true,
    });
    if (!session) {
      setSales([]);
      return;
    }
    try {
      const salesRes = await fetch(
        `/api/studio/sales?${signedReadQuery(session)}`,
      );
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
    if (!gatewayAddr) return;
    await writeContractAsync({
      address: gatewayAddr,
      abi: promptGatewayAbi,
      chainId: ARC.chainId,
      functionName: "withdrawSeller",
    });
  }

  const keepPct = sellerKeepPercent();
  const feePct = networkFeePercent();

  if (!isConnected || !address) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 md:px-8">
        <UsdcOnArcMark size="sm" />
        <h1 className="mt-3 font-display text-3xl tracking-tight">Studio</h1>
        <p className="mt-2 max-w-md text-muted">
          Connect your wallet to list tools, set prices in USDC on Arc, and
          withdraw earnings.
        </p>
        <div className="mt-6">
          <WalletConnect />
        </div>
      </main>
    );
  }

  const pendingWei = typeof pending === "bigint" ? pending : BigInt(0);
  const paidSales = sales.filter(isOnChainSale);
  const rehearsalSales = sales.filter(
    (s) => s.status === "fulfilled" && isRehearsalRequest(s),
  );
  const recent = sales.slice(0, 5);
  const shortAddr = `${address.slice(0, 6)}…${address.slice(-4)}`;
  const gatewayReady = Boolean(gatewayAddr);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      <div className="animate-fade-up max-w-xl">
        <UsdcOnArcMark size="sm" />
        <h1 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
          Studio
        </h1>
        <p className="mt-2 text-muted">
          List tools, price them in USDC on Arc, and withdraw to your wallet.
        </p>
      </div>

      {/* Payout wallet */}
      <section className="mt-10 border border-line bg-surface/80">
        <div className="border-b border-line px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            Payout wallet
          </p>
          <p className="mt-2 font-mono text-sm text-foreground">{shortAddr}</p>
          <p className="mt-1 text-xs text-muted">
            Paid unlocks settle as USDC on Arc to this connected wallet — not
            other networks.
          </p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">
              Available USDC on Arc
            </p>
            <p className="mt-2 font-mono text-2xl">
              {!gatewayReady || pendingError ? (
                "—"
              ) : (
                <UsdcOnArcPrice
                  amount={formatUsdcWei(pendingWei)}
                  withMark
                />
              )}
            </p>
            {!gatewayReady && (
              <p className="mt-2 max-w-sm text-sm text-amber-800">
                Payment address is not configured for this network, so balance
                cannot be read.
              </p>
            )}
            {gatewayReady &&
              pendingWei === BigInt(0) &&
              rehearsalSales.length > 0 &&
              paidSales.length === 0 && (
                <p className="mt-2 max-w-md text-sm text-muted">
                  Your {rehearsalSales.length} completed sale
                  {rehearsalSales.length === 1 ? "" : "s"}{" "}
                  {rehearsalSales.length === 1 ? "was" : "were"} rehearsal
                  unlocks (Activity / demo). Those do not credit withdrawable
                  USDC on Arc — buyers must pay on Arc for earnings to appear
                  here.
                </p>
              )}
            {gatewayReady &&
              pendingWei === BigInt(0) &&
              paidSales.length > 0 && (
                <p className="mt-2 max-w-md text-sm text-muted">
                  Paid sales are on record, but this wallet has nothing pending
                  on Arc. Confirm you&apos;re connected as the payout wallet,
                  or that earnings were already withdrawn.
                </p>
              )}
          </div>
          <button
            type="button"
            disabled={
              isPending || pendingWei === BigInt(0) || !gatewayReady
            }
            onClick={() => void onWithdraw()}
            className="h-10 bg-accent px-4 text-sm font-medium text-surface disabled:opacity-40"
          >
            {isPending ? "Confirm in wallet…" : "Withdraw USDC on Arc"}
          </button>
        </div>
      </section>

      {/* Fee strip — SaaS copy */}
      <p className="mt-4 text-sm text-muted">
        You keep {keepPct}% of each paid request; arcdot. keeps {feePct}% for
        the network.
      </p>

      {/* Stats */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="border border-line bg-surface p-5">
          <p className="text-xs uppercase tracking-wider text-muted">
            Your tools
          </p>
          <p className="mt-2 font-mono text-2xl">{services.length}</p>
          <Link
            href="/studio/services"
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            Manage tools
          </Link>
        </div>
        <div className="border border-line bg-surface p-5">
          <p className="text-xs uppercase tracking-wider text-muted">
            Paid sales
          </p>
          <p className="mt-2 font-mono text-2xl">
            {sales.length > 0 ? paidSales.length : "—"}
          </p>
          {rehearsalSales.length > 0 && (
            <p className="mt-1 text-xs text-muted">
              + {rehearsalSales.length} rehearsal (no withdraw)
            </p>
          )}
          <Link
            href="/studio/sales"
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            View sales
          </Link>
        </div>
      </section>

      {/* Studio-only quick links */}
      <nav className="mt-10 flex flex-wrap gap-2" aria-label="Studio">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={[
              "inline-flex h-10 items-center px-4 text-sm",
              link.href === "/create"
                ? "bg-accent font-medium text-surface"
                : "border border-line bg-surface text-foreground",
            ].join(" ")}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Recent sales */}
      <section className="mt-14">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
          Recent sales
        </h2>
        {recent.length === 0 ? (
          <div className="mt-4 border border-line bg-surface/60 px-5 py-8">
            <p className="text-muted">No sales yet.</p>
            <Link
              href="/create"
              className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
            >
              Publish your first tool
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {recent.map((s) => {
              const rehearsal = isRehearsalRequest(s);
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap justify-between gap-2 py-4"
                >
                  <p className="font-medium">{s.service_slug ?? "Tool"}</p>
                  <p className="font-mono text-xs text-muted">
                    {rehearsal ? (
                      <>Rehearsal · no on-chain credit</>
                    ) : (
                      <>
                        {statusLabel(s.status)}
                        {s.seller_amount_wei ? (
                          <>
                            {" · "}
                            <UsdcOnArcPrice
                              amount={formatUsdcWei(s.seller_amount_wei)}
                              className="text-xs"
                            />
                          </>
                        ) : null}
                      </>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Outbound pillars only */}
      <footer className="mt-14 border-t border-line pt-8">
        <p className="text-sm text-muted">Continue</p>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          <li>
            <Link
              href="/hub"
              className="group flex items-baseline justify-between gap-4 py-4"
            >
              <div>
                <p className="font-medium group-hover:underline group-hover:underline-offset-4">
                  How buyers connect
                </p>
                <p className="mt-1 text-sm text-muted">
                  Wire MCP clients to discover your tools.
                </p>
              </div>
              <span className="text-sm text-muted">→</span>
            </Link>
          </li>
          <li>
            <Link
              href="/services"
              className="group flex items-baseline justify-between gap-4 py-4"
            >
              <div>
                <p className="font-medium group-hover:underline group-hover:underline-offset-4">
                  See Explore
                </p>
                <p className="mt-1 text-sm text-muted">
                  Browse live tools on the network.
                </p>
              </div>
              <span className="text-sm text-muted">→</span>
            </Link>
          </li>
        </ul>
      </footer>
    </main>
  );
}
