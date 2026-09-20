"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount, useSignMessage } from "wagmi";
import { buildUpdateProfileChallenge } from "@/lib/auth/updateProfileChallenge";
import {
  ensureSignedReadSession,
  signedReadQuery,
} from "@/lib/auth/signedReadSession";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function StudioProfilePage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookUnlocked, setWebhookUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!address) return;
    // Public fields — never prompt on open
    const res = await fetch(`/api/studio/profile?address=${address}`);
    const data = await res.json();
    if (data.profile) {
      setDisplayName(data.profile.display_name ?? "");
      setBio(data.profile.bio ?? "");
    }

    const session = await ensureSignedReadSession({
      address,
      signMessageAsync,
      silent: true,
    });
    if (!session) {
      setWebhookUnlocked(false);
      return;
    }
    const privateRes = await fetch(
      `/api/studio/profile?${signedReadQuery(session)}`,
    );
    const privateData = await privateRes.json();
    if (privateData.profile && "webhook_url" in privateData.profile) {
      setWebhookUrl(privateData.profile.webhook_url ?? "");
      setWebhookUnlocked(true);
    }
  }, [address, signMessageAsync]);

  useEffect(() => {
    void load();
  }, [load]);

  async function unlockWebhook() {
    if (!address) return;
    setBusy(true);
    const toastId = toast.loading("Confirm in your wallet to unlock…");
    try {
      const session = await ensureSignedReadSession({
        address,
        signMessageAsync,
        silent: false,
      });
      if (!session) {
        toast.error("Signature cancelled", { id: toastId });
        return;
      }
      const res = await fetch(
        `/api/studio/profile?${signedReadQuery(session)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not unlock", { id: toastId });
        return;
      }
      if (data.profile) {
        setDisplayName(data.profile.display_name ?? displayName);
        setBio(data.profile.bio ?? bio);
        setWebhookUrl(data.profile.webhook_url ?? "");
        setWebhookUnlocked(true);
      }
      toast.success("Private settings unlocked", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not unlock", {
        id: toastId,
      });
    } finally {
      setBusy(false);
    }
  }

  async function signAndPayload() {
    if (!address) throw new Error("Connect wallet");
    const issuedAt = Math.floor(Date.now() / 1000);
    const challenge = buildUpdateProfileChallenge({
      owner_address: address,
      display_name: displayName,
      webhook_url: webhookUrl,
      issuedAt,
    });
    const signature = await signMessageAsync({ message: challenge });
    return {
      display_name: displayName,
      bio,
      webhook_url: webhookUrl,
      owner_address: address,
      signature,
      issuedAt,
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    setBusy(true);
    const toastId = toast.loading("Confirm the signature in your wallet…");
    try {
      const payload = await signAndPayload();
      toast.loading("Saving profile…", { id: toastId });
      const res = await fetch("/api/studio/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not save profile", { id: toastId });
        return;
      }
      if (data.durable === false) {
        toast.error("Profile was not written to Supabase", {
          id: toastId,
          description: "Restart the app after setting Supabase keys in .env.local.",
        });
        return;
      }
      const savedWallet =
        typeof data.profile?.wallet_address === "string"
          ? data.profile.wallet_address
          : address;
      if (data.profile?.webhook_url !== undefined) {
        setWebhookUrl(data.profile.webhook_url ?? "");
        setWebhookUnlocked(true);
      }
      toast.success("Profile saved", {
        id: toastId,
        description: `Synced for ${shortAddr(savedWallet)}`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save profile";
      const cancelled =
        /rejected|denied|cancel/i.test(message) ||
        (err as { code?: number })?.code === 4001;
      toast.error(cancelled ? "Signature cancelled" : message, {
        id: toastId,
      });
    } finally {
      setBusy(false);
    }
  }

  async function onTestPing() {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    setBusy(true);
    const toastId = toast.loading("Confirm the signature in your wallet…");
    try {
      const payload = await signAndPayload();
      toast.loading("Sending test ping…", { id: toastId });
      const res = await fetch("/api/studio/webhook/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Ping failed", { id: toastId });
        return;
      }
      toast.success("Test ping sent", { id: toastId });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ping failed";
      const cancelled =
        /rejected|denied|cancel/i.test(message) ||
        (err as { code?: number })?.code === 4001;
      toast.error(cancelled ? "Signature cancelled" : message, {
        id: toastId,
      });
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
        <p className="mt-2 text-muted">Connect your wallet to edit your profile.</p>
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
      {address && (
        <p className="mt-3 font-mono text-xs text-muted">
          Saving as {shortAddr(address)}
        </p>
      )}

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
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">Sale webhook URL</span>
            {!webhookUnlocked && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void unlockWebhook()}
                className="text-xs underline underline-offset-4 text-muted hover:text-foreground"
              >
                Unlock private settings
              </button>
            )}
          </div>
          <input
            className={inputClass}
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://…"
            maxLength={500}
            disabled={!webhookUnlocked && webhookUrl === ""}
          />
          <p className="text-xs text-muted">
            Optional. We POST a sale receipt when an unlock completes.
            {!webhookUnlocked
              ? " Unlock once to load a saved URL, or paste a new one and save."
              : ""}
          </p>
          {!webhookUnlocked && (
            <button
              type="button"
              className="text-xs text-muted underline underline-offset-4"
              onClick={() => setWebhookUnlocked(true)}
            >
              Enter a new webhook without loading the saved one
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="h-11 bg-accent px-5 text-sm font-medium text-surface disabled:opacity-50"
          >
            {busy ? "Working…" : "Save profile"}
          </button>
          <button
            type="button"
            disabled={busy || !webhookUrl.trim()}
            onClick={() => void onTestPing()}
            className="h-11 border border-line bg-surface px-5 text-sm disabled:opacity-50"
          >
            Send test ping
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
