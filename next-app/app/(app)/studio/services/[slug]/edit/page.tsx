"use client";

import { WalletConnect } from "@/components/wallet/WalletConnect";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { UsdcOnArcMark, UsdcOnArcPrice } from "@/components/brand/UsdcOnArcMark";
import { ServiceImageField } from "@/components/studio/ServiceImageField";
import { buildUpdateChallenge } from "@/lib/auth/updateServiceChallenge";
import { upstreamUrlError } from "@/lib/seller/upstreamUrl";
import {
  formatUsdcAmount,
  networkFeePercent,
  sellerKeepPercent,
  splitPriceUsdc,
} from "@/lib/studio/fees";
import type { ServiceRow } from "@/lib/types/catalog";

const inputClass =
  "w-full rounded-2xl border border-line bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground";

export default function EditServicePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [service, setService] = useState<ServiceRow | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceUsdc, setPriceUsdc] = useState("0.01");
  const [upstreamUrl, setUpstreamUrl] = useState("");
  const [upstreamBearer, setUpstreamBearer] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tariff = useMemo(() => splitPriceUsdc(priceUsdc), [priceUsdc]);
  const keepPct = sellerKeepPercent();
  const feePct = networkFeePercent();
  const shortAddr = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : "your wallet";

  useEffect(() => {
    if (!address) return;
    (async () => {
      const res = await fetch(`/api/studio/services?address=${address}`);
      const data = await res.json();
      const found = (data.services as ServiceRow[] | undefined)?.find(
        (s) => s.slug === params.slug,
      );
      if (!found) {
        setError("Tool not found");
        return;
      }
      setService(found);
      setTitle(found.title);
      setDescription(found.description);
      setPriceUsdc(found.price_usdc);
      setUpstreamUrl(found.upstream_url ?? "");
      setUpstreamBearer(found.upstream_bearer ?? "");
      setImageUrl(found.image_url ?? null);
    })();
  }, [address, params.slug]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address || !service) return;
    setBusy(true);
    setError(null);
    try {
      const issuedAt = Math.floor(Date.now() / 1000);
      const upstream = upstreamUrl.trim();
      const urlErr = upstreamUrlError(upstream);
      if (urlErr) {
        setError(urlErr);
        setBusy(false);
        return;
      }
      const challenge = buildUpdateChallenge({
        slug: service.slug,
        owner_address: address,
        issuedAt,
        title,
        price_usdc: priceUsdc,
        upstream_url: upstream,
      });
      const signature = await signMessageAsync({ message: challenge });
      const res = await fetch(`/api/services/${service.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price_usdc: priceUsdc,
          upstream_url: upstream,
          upstream_bearer: upstreamBearer.trim(),
          image_url: imageUrl,
          owner_address: address,
          signature,
          issuedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save");
        return;
      }
      router.push("/studio/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (!isConnected) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 md:px-8">
        <WalletConnect />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      <div className="max-w-xl">
        <Link
          href="/studio/services"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Your tools
        </Link>
        <UsdcOnArcMark size="sm" className="mt-5" />
        <h1 className="mt-3 font-display text-3xl tracking-tight">Edit tool</h1>
        <p className="mt-2 text-muted">
          Update listing, USDC on Arc price, and the HTTPS endpoint buyers
          unlock.
        </p>
      </div>

      {!service ? (
        <p className="mt-6 text-muted">{error || "Loading…"}</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-10 max-w-xl space-y-5">
          <section className="rounded-2xl border border-line bg-surface/80 p-5 md:p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
              Identity
            </h2>
            <div className="mt-5 space-y-5">
              <label className="block space-y-2 text-sm font-medium">
                <span>Tool name</span>
                <input
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={80}
                />
              </label>
              <div className="space-y-2 text-sm font-medium">
                <span>Tool key</span>
                <p className={`${inputClass} font-mono text-muted`}>
                  {service.slug}
                </p>
                <span className="block text-xs font-normal text-muted">
                  Fixed after publish — used in Explore and MCP.
                </span>
              </div>
              <label className="block space-y-2 text-sm font-medium">
                <span>What it does</span>
                <textarea
                  className={`${inputClass} resize-y`}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  maxLength={500}
                />
              </label>
              <div className="space-y-2 text-sm font-medium">
                <span>Logo / cover</span>
                <ServiceImageField
                  value={imageUrl}
                  onChange={setImageUrl}
                  address={address}
                  signMessageAsync={signMessageAsync}
                  disabled={busy}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface/80 p-5 md:p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
              Your agent
            </h2>
            <div className="mt-5 space-y-5">
              <label className="block space-y-2 text-sm font-medium">
                <span>Agent endpoint</span>
                <input
                  className={`${inputClass} font-mono`}
                  value={upstreamUrl}
                  onChange={(e) => setUpstreamUrl(e.target.value)}
                  placeholder="https://…"
                  maxLength={500}
                  required
                />
                <span className="block text-xs font-normal text-muted">
                  Required. Paid requests POST to this HTTPS URL.
                </span>
              </label>
              <label className="block space-y-2 text-sm font-medium">
                <span>API bearer token (optional)</span>
                <input
                  type="password"
                  className={`${inputClass} font-mono`}
                  value={upstreamBearer}
                  onChange={(e) => setUpstreamBearer(e.target.value)}
                  maxLength={500}
                  autoComplete="off"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface/80 p-5 md:p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
              Pricing & payout (USDC on Arc)
            </h2>
            <div className="mt-5 space-y-5">
              <label className="block space-y-2 text-sm font-medium">
                <span className="inline-flex items-center gap-2">
                  Price per request
                  <UsdcOnArcMark size="sm" />
                </span>
                <input
                  className={`${inputClass} font-mono`}
                  value={priceUsdc}
                  onChange={(e) => setPriceUsdc(e.target.value)}
                  required
                  placeholder="0.01"
                />
                <span className="block text-xs font-normal text-muted">
                  Minimum 0.01 USDC on Arc per request. Other networks will not
                  settle.
                </span>
              </label>

              <div className="rounded-2xl border border-line bg-background/80 px-4 py-3 text-sm">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                  Tariff preview
                </p>
                {tariff ? (
                  <ul className="mt-3 space-y-1.5 text-muted">
                    <li className="flex justify-between gap-3">
                      <span>Buyers pay</span>
                      <UsdcOnArcPrice
                        amount={formatUsdcAmount(tariff.buyer)}
                        className="font-mono text-foreground"
                      />
                    </li>
                    <li className="flex justify-between gap-3">
                      <span>You receive ~</span>
                      <UsdcOnArcPrice
                        amount={formatUsdcAmount(tariff.seller)}
                        className="font-mono text-foreground"
                      />
                    </li>
                    <li className="flex justify-between gap-3">
                      <span>Network fee</span>
                      <UsdcOnArcPrice
                        amount={formatUsdcAmount(tariff.network)}
                        className="font-mono text-foreground"
                      />
                    </li>
                  </ul>
                ) : (
                  <p className="mt-2 text-muted">Enter a valid price to preview.</p>
                )}
                <p className="mt-3 text-xs text-muted">
                  You keep {keepPct}%; arcdot. keeps {feePct}% per request.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-background/80 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                  Payout wallet
                </p>
                <p className="mt-2 font-mono text-sm">{shortAddr}</p>
                <p className="mt-1 text-xs text-muted">
                  Connected wallet receives your share as USDC on Arc after each
                  unlock.
                </p>
              </div>
            </div>
          </section>

          <div className="rounded-2xl border border-line bg-surface/80 px-5 py-5 md:px-6">
            {error && (
              <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="h-11 rounded-2xl bg-accent px-5 text-sm font-medium text-surface disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
