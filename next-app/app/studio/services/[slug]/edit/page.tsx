"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { buildUpdateChallenge } from "@/lib/auth/updateServiceChallenge";
import type { ServiceRow } from "@/lib/types/catalog";

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
        setError("Service not found");
        return;
      }
      setService(found);
      setTitle(found.title);
      setDescription(found.description);
      setPriceUsdc(found.price_usdc);
      setSystemPrompt(found.system_prompt);
    })();
  }, [address, params.slug]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address || !service) return;
    setBusy(true);
    setError(null);
    try {
      const issuedAt = Math.floor(Date.now() / 1000);
      const challenge = buildUpdateChallenge({
        slug: service.slug,
        owner_address: address,
        issuedAt,
        title,
        price_usdc: priceUsdc,
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

  const inputClass =
    "w-full border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-foreground";

  if (!isConnected) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <ConnectButton />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-4">
      <Link
        href="/studio/services"
        className="text-sm text-muted hover:text-foreground"
      >
        ← Services
      </Link>
      <h1 className="mt-6 font-display text-4xl tracking-tight">Edit service</h1>
      {!service ? (
        <p className="mt-6 text-muted">{error || "Loading…"}</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-10 max-w-xl space-y-5">
          <label className="block space-y-2 text-sm font-medium">
            <span>Title</span>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Description</span>
            <textarea
              className={inputClass}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>
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
            <span>Instructions for the model</span>
            <textarea
              className={inputClass}
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="h-11 bg-accent px-5 text-sm font-medium text-surface disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}
    </main>
  );
}
