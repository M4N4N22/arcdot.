"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { buildCreateChallenge } from "@/lib/auth/createServiceChallenge";
import {
  formatUsdcAmount,
  networkFeePercent,
  sellerKeepPercent,
  splitPriceUsdc,
} from "@/lib/studio/fees";

export default function CreateServicePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [priceUsdc, setPriceUsdc] = useState("0.01");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful specialist. Keep answers short and clear.",
  );
  const [upstreamUrl, setUpstreamUrl] = useState("");
  const [upstreamBearer, setUpstreamBearer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tariff = useMemo(() => splitPriceUsdc(priceUsdc), [priceUsdc]);
  const keepPct = sellerKeepPercent();
  const feePct = networkFeePercent();

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
    setBusy(true);
    try {
      const issuedAt = Math.floor(Date.now() / 1000);
      const upstream = upstreamUrl.trim();
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
          system_prompt: systemPrompt,
          upstream_url: upstream,
          upstream_bearer: upstreamBearer.trim(),
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

  const inputClass =
    "w-full border border-line bg-background px-4 py-3 text-sm outline-none focus:border-foreground";

  const shortAddr = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      <div className="max-w-xl animate-fade-up">
        <Link
          href="/studio"
          className="text-sm text-muted hover:text-foreground"
        >
          ← Studio
        </Link>
        <h1 className="mt-4 font-display text-3xl tracking-tight md:text-4xl">
          Publish a tool
        </h1>
        <p className="mt-2 text-muted">
          Register your endpoint, set a per-request price, and earn USDC when
          agents unlock it.
        </p>
      </div>

      {!isConnected ? (
        <div className="mt-10 flex flex-col items-start gap-3">
          <p className="text-sm text-muted">Connect your wallet to continue.</p>
          <ConnectButton />
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-10 max-w-xl border border-line bg-surface/60"
        >
          <div className="space-y-5 border-b border-line px-5 py-6 md:px-6">
            <label className="block space-y-2 text-sm font-medium">
              <span>Tool name</span>
              <input
                required
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className={inputClass}
                placeholder="Supply chain forecaster"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Tool key</span>
              <input
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className={`${inputClass} font-mono`}
                placeholder="supply-chain-forecaster"
              />
              <span className="block text-xs font-normal text-muted">
                Used in Explore and as an MCP tool name.
              </span>
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>What it does</span>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="What does the buyer get?"
              />
            </label>
          </div>

          <div className="space-y-5 border-b border-line px-5 py-6 md:px-6">
            <label className="block space-y-2 text-sm font-medium">
              <span>Hosting URL (optional)</span>
              <input
                value={upstreamUrl}
                onChange={(e) => setUpstreamUrl(e.target.value)}
                className={`${inputClass} font-mono`}
                placeholder="https://…"
                maxLength={500}
              />
              <span className="block text-xs font-normal text-muted">
                If set, paid requests POST to your HTTPS API. Otherwise we use
                your instructions below.
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
            <label className="block space-y-2 text-sm font-medium">
              <span>Instructions</span>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={4}
                className={inputClass}
              />
              <span className="block text-xs font-normal text-muted">
                Used when you do not set a hosting URL.
              </span>
            </label>
          </div>

          <div className="space-y-5 border-b border-line px-5 py-6 md:px-6">
            <label className="block space-y-2 text-sm font-medium">
              <span>Price per request (USDC)</span>
              <input
                required
                value={priceUsdc}
                onChange={(e) => setPriceUsdc(e.target.value)}
                className={`${inputClass} font-mono`}
                placeholder="0.01"
              />
            </label>

            <div className="border border-line bg-background/70 px-4 py-3 text-sm">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                Tariff preview
              </p>
              {tariff ? (
                <p className="mt-2 text-muted">
                  Buyers pay{" "}
                  <span className="font-mono text-foreground">
                    {formatUsdcAmount(tariff.buyer)} USDC
                  </span>
                  {" · "}
                  You receive ~{" "}
                  <span className="font-mono text-foreground">
                    {formatUsdcAmount(tariff.seller)} USDC
                  </span>
                  {" · "}
                  Network fee{" "}
                  <span className="font-mono text-foreground">
                    {formatUsdcAmount(tariff.network)} USDC
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-muted">Enter a valid price to preview.</p>
              )}
              <p className="mt-2 text-xs text-muted">
                You keep {keepPct}%; arcdot. keeps {feePct}% per request.
              </p>
            </div>

            <div className="border border-line bg-background/70 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                Payout wallet
              </p>
              <p className="mt-2 font-mono text-sm">{shortAddr}</p>
              <p className="mt-1 text-xs text-muted">
                Connected wallet receives your share after each unlock.
              </p>
            </div>
          </div>

          <div className="px-5 py-6 md:px-6">
            {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="h-11 w-full bg-accent px-5 text-sm font-medium text-surface disabled:opacity-50 sm:w-auto"
            >
              {busy ? "Publishing…" : "Publish to network"}
            </button>
            <p className="mt-3 text-xs text-muted">
              You will sign a short message to prove you own this wallet.
            </p>
          </div>
        </form>
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
