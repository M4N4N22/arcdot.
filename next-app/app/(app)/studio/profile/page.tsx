"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { buildUpdateProfileChallenge } from "@/lib/auth/updateProfileChallenge";

export default function StudioProfilePage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!address) return;
    const res = await fetch(`/api/studio/profile?address=${address}`);
    const data = await res.json();
    if (data.profile) {
      setDisplayName(data.profile.display_name ?? "");
      setBio(data.profile.bio ?? "");
    }
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const issuedAt = Math.floor(Date.now() / 1000);
      const challenge = buildUpdateProfileChallenge({
        owner_address: address,
        display_name: displayName,
        issuedAt,
      });
      const signature = await signMessageAsync({ message: challenge });
      const res = await fetch("/api/studio/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          bio,
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
      setSaved(true);
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
      <main className="mx-auto max-w-5xl px-6 py-10 md:px-8">
        <h1 className="font-display text-3xl tracking-tight">Profile</h1>
        <p className="mt-2 text-muted">Connect your wallet to edit your seller profile.</p>
        <div className="mt-6">
          <ConnectButton />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-6 md:px-8">
      <Link href="/studio" className="text-sm text-muted hover:text-foreground">
        ← Studio
      </Link>
      <h1 className="mt-5 font-display text-3xl tracking-tight">Profile</h1>
      <p className="mt-2 max-w-lg text-muted">
        How buyers see you on public listings. Agents still pay your wallet
        address.
      </p>

      <form onSubmit={onSubmit} className="mt-10 max-w-xl space-y-5">
        <label className="block space-y-2 text-sm font-medium">
          <span>Display name</span>
          <input
            className={inputClass}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your studio name"
            maxLength={80}
          />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          <span>Bio</span>
          <textarea
            className={inputClass}
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="What do you publish?"
            maxLength={500}
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        {saved && <p className="text-sm text-muted">Saved.</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="h-11 bg-accent px-5 text-sm font-medium text-surface disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save profile"}
          </button>
          <Link
            href={`/u/${address}`}
            className="text-sm underline underline-offset-4"
          >
            View public page
          </Link>
        </div>
      </form>
    </main>
  );
}
