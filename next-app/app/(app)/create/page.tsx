"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { buildCreateChallenge } from "@/lib/auth/createServiceChallenge";

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
        setError(data.error || "Could not publish service");
        return;
      }
      router.push(`/services/${data.service.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-foreground";

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      <div className="max-w-xl animate-fade-up">
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          Create a service
        </h1>
        <p className="mt-2 text-muted">
          Publish a gated endpoint. Buyers pay in USDC on Arc and unlock your
          reply — hosted here or on your own API.
        </p>
      </div>

      {!isConnected ? (
        <div className="mt-10 flex flex-col items-start gap-3">
          <p className="text-sm text-muted">Connect your wallet to continue.</p>
          <ConnectButton />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-10 max-w-xl space-y-5">
          <label className="block space-y-2 text-sm font-medium">
            <span>Title</span>
            <input
              required
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={inputClass}
              placeholder="Quick Brief"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>URL slug</span>
            <input
              required
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className={`${inputClass} font-mono`}
              placeholder="quick-brief"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Description</span>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="What does the buyer get?"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Price (USDC)</span>
            <input
              required
              value={priceUsdc}
              onChange={(e) => setPriceUsdc(e.target.value)}
              className={`${inputClass} font-mono`}
              placeholder="0.01"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Your API URL (optional)</span>
            <input
              value={upstreamUrl}
              onChange={(e) => setUpstreamUrl(e.target.value)}
              className={`${inputClass} font-mono`}
              placeholder="https://…"
              maxLength={500}
            />
            <span className="block text-xs font-normal text-muted">
              If set, arcdot. POSTs paid requests to your HTTPS API instead of
              using built-in model instructions.
            </span>
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>API bearer token (optional)</span>
            <input
              type="password"
              value={upstreamBearer}
              onChange={(e) => setUpstreamBearer(e.target.value)}
              className={`${inputClass} font-mono`}
              placeholder="Only stored for your service"
              maxLength={500}
              autoComplete="off"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Instructions for the model</span>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              className={inputClass}
            />
            <span className="block text-xs font-normal text-muted">
              Used when you do not set an API URL.
            </span>
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="h-11 bg-accent px-5 text-sm font-medium text-surface disabled:opacity-50"
          >
            {busy ? "Publishing…" : "Publish service"}
          </button>
          <p className="text-xs text-muted">
            You will sign a short message to prove you own this wallet.{" "}
            <Link href="/services" className="underline underline-offset-4">
              Try instead
            </Link>
          </p>
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
