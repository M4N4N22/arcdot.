"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { ServiceImageField } from "@/components/studio/ServiceImageField";
import { buildUpdateChallenge } from "@/lib/auth/updateServiceChallenge";
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
  const [systemPrompt, setSystemPrompt] = useState("");
  const [upstreamUrl, setUpstreamUrl] = useState("");
  const [upstreamBearer, setUpstreamBearer] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      setSystemPrompt(found.system_prompt);
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
          system_prompt: systemPrompt,
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
        <ConnectButton />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      <Link
        href="/studio/services"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Your tools
      </Link>
      <h1 className="mt-5 font-display text-3xl tracking-tight">Edit tool</h1>
      {!service ? (
        <p className="mt-6 text-muted">{error || "Loading…"}</p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-10 max-w-xl space-y-5 rounded-2xl border border-line bg-surface/80 p-5 md:p-6"
        >
          <label className="block space-y-2 text-sm font-medium">
            <span>Title</span>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={80}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Description</span>
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
          <label className="block space-y-2 text-sm font-medium">
            <span>Price (USDC)</span>
            <input
              className={`${inputClass} font-mono`}
              value={priceUsdc}
              onChange={(e) => setPriceUsdc(e.target.value)}
              required
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Your API URL (optional)</span>
            <input
              className={`${inputClass} font-mono`}
              value={upstreamUrl}
              onChange={(e) => setUpstreamUrl(e.target.value)}
              placeholder="https://…"
              maxLength={500}
            />
            <span className="block text-xs font-normal text-muted">
              Leave blank to use model instructions on arcdot.
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
          <label className="block space-y-2 text-sm font-medium">
            <span>Instructions for the model</span>
            <textarea
              className={`${inputClass} resize-y`}
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              maxLength={2000}
            />
          </label>
          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
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
        </form>
      )}
    </main>
  );
}
