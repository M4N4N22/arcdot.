"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { PublishPreview } from "@/components/studio/PublishPreview";
import { ServiceImageField } from "@/components/studio/ServiceImageField";
import { buildCreateChallenge } from "@/lib/auth/createServiceChallenge";
import { upstreamUrlError } from "@/lib/seller/upstreamUrl";
import {
  formatUsdcAmount,
  networkFeePercent,
  sellerKeepPercent,
  splitPriceUsdc,
} from "@/lib/studio/fees";

const inputClass =
  "w-full rounded-2xl border border-line bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground";

export default function CreateServicePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
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
  const slugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 2;
  const shortAddr = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : "your wallet";

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(value));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!address) {
      setError("Connect your wallet first.");
      return;
    }
    if (!slugValid) {
      setError("Tool key must be lowercase letters, numbers, and hyphens.");
      return;
    }
    const upstream = upstreamUrl.trim();
    const urlErr = upstreamUrlError(upstream);
    if (urlErr) {
      setError(urlErr);
      return;
    }
    setBusy(true);
    try {
      const issuedAt = Math.floor(Date.now() / 1000);
      const challenge = buildCreateChallenge({
        slug,
        title,
        price_usdc: priceUsdc,
        owner_address: address,
        issuedAt,
        upstream_url: upstream,
      });
      const signature = await signMessageAsync({ message: challenge });
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title,
          description,
          price_usdc: priceUsdc,
          system_prompt: "",
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
        setError(data.error || "Could not publish tool");
        return;
      }
      router.push("/studio/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      <div className="max-w-xl animate-fade-up">
        <Link
          href="/studio"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Studio
        </Link>
        <h1 className="mt-4 font-display text-3xl tracking-tight md:text-4xl">
          Publish a tool
        </h1>
        <p className="mt-2 text-muted">
          Point agents at your HTTPS endpoint, set a per-request price, and earn
          USDC when they unlock it.
        </p>
      </div>

      {!isConnected ? (
        <div className="mt-10 max-w-xl rounded-2xl border border-line bg-surface/80 px-5 py-6">
          <p className="text-sm text-muted">Connect your wallet to continue.</p>
          <div className="mt-4">
            <ConnectButton />
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Identity */}
            <section className="rounded-2xl border border-line bg-surface/80 p-5 md:p-6">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
                Identity
              </h2>
              <div className="mt-5 space-y-5">
                <label className="block space-y-2 text-sm font-medium">
                  <span>Tool name</span>
                  <input
                    required
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className={inputClass}
                    placeholder="Supply chain forecaster"
                    maxLength={80}
                  />
                  <span className="block text-xs font-normal text-muted">
                    {title.length}/80
                  </span>
                </label>

                <label className="block space-y-2 text-sm font-medium">
                  <span>Tool key</span>
                  <input
                    required
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className={`${inputClass} font-mono`}
                    placeholder="supply-chain-forecaster"
                    maxLength={48}
                  />
                  <span className="block text-xs font-normal text-muted">
                    Used in Explore and as an MCP tool name.
                    {slug && !slugValid ? (
                      <span className="text-red-700"> Invalid key.</span>
                    ) : null}
                  </span>
                </label>

                <label className="block space-y-2 text-sm font-medium">
                  <span>What it does</span>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-y`}
                    placeholder="What does the buyer get?"
                    maxLength={500}
                  />
                  <span className="block text-xs font-normal text-muted">
                    {description.length}/500
                  </span>
                </label>

                <div className="space-y-2 text-sm font-medium">
                  <span>Logo / cover</span>
                  <p className="text-xs font-normal text-muted">
                    Optional. Shows on Explore and the tool page.
                  </p>
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

            {/* Fulfillment */}
            <section className="rounded-2xl border border-line bg-surface/80 p-5 md:p-6">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
                Your agent
              </h2>
              <div className="mt-5 space-y-5">
                <label className="block space-y-2 text-sm font-medium">
                  <span>Agent endpoint</span>
                  <input
                    required
                    value={upstreamUrl}
                    onChange={(e) => setUpstreamUrl(e.target.value)}
                    className={`${inputClass} font-mono`}
                    placeholder="https://…"
                    maxLength={500}
                  />
                  <span className="block text-xs font-normal text-muted">
                    Required. After a buyer pays, we POST the request to this
                    HTTPS URL and return your reply. Local rehearsal:{" "}
                    <span className="font-mono text-[11px]">
                      http://localhost:3000/api/agents/demo-brief
                    </span>
                  </span>
                </label>
                <label className="block space-y-2 text-sm font-medium">
                  <span>API bearer token (optional)</span>
                  <input
                    type="password"
                    value={upstreamBearer}
                    onChange={(e) => setUpstreamBearer(e.target.value)}
                    className={`${inputClass} font-mono`}
                    placeholder="Only stored for your tool"
                    maxLength={500}
                    autoComplete="off"
                  />
                </label>
              </div>
            </section>

            {/* Pricing */}
            <section className="rounded-2xl border border-line bg-surface/80 p-5 md:p-6">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
                Pricing & payout
              </h2>
              <div className="mt-5 space-y-5">
                <label className="block space-y-2 text-sm font-medium">
                  <span>Price per request (USDC)</span>
                  <input
                    required
                    value={priceUsdc}
                    onChange={(e) => setPriceUsdc(e.target.value)}
                    className={`${inputClass} font-mono`}
                    placeholder="0.01"
                  />
                  <span className="block text-xs font-normal text-muted">
                    Minimum 0.01 USDC per request.
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
                        <span className="font-mono text-foreground">
                          {formatUsdcAmount(tariff.buyer)} USDC
                        </span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>You receive ~</span>
                        <span className="font-mono text-foreground">
                          {formatUsdcAmount(tariff.seller)} USDC
                        </span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span>Network fee</span>
                        <span className="font-mono text-foreground">
                          {formatUsdcAmount(tariff.network)} USDC
                        </span>
                      </li>
                    </ul>
                  ) : (
                    <p className="mt-2 text-muted">
                      Enter a valid price to preview.
                    </p>
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
                    Connected wallet receives your share after each unlock.
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
                disabled={busy || !slugValid}
                className="h-11 w-full rounded-2xl bg-accent px-5 text-sm font-medium text-surface disabled:opacity-50 sm:w-auto"
              >
                {busy ? "Publishing…" : "Publish to network"}
              </button>
              <p className="mt-3 text-xs text-muted">
                You will sign a short message to prove you own this wallet.
              </p>
            </div>
          </form>

          <aside className="lg:sticky lg:top-6">
            <PublishPreview
              title={title}
              description={description}
              priceUsdc={priceUsdc}
              slug={slug}
              imageUrl={imageUrl}
              ownerLabel={shortAddr}
            />
            <p className="mt-3 text-xs leading-relaxed text-muted">
              This is how your tool will look in Explore once published.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
