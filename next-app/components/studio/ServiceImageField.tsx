"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BrandMark } from "@/components/explore/BrandMark";
import { buildUploadImageChallenge } from "@/lib/auth/uploadImageChallenge";
import {
  SERVICE_IMAGE_MAX_BYTES,
  SERVICE_IMAGE_MIME,
  isValidServiceImageUrl,
} from "@/lib/services/image";

type ServiceImageFieldProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  address: string | undefined;
  signMessageAsync: (args: { message: string }) => Promise<`0x${string}`>;
  disabled?: boolean;
};

export function ServiceImageField({
  value,
  onChange,
  address,
  signMessageAsync,
  disabled = false,
}: ServiceImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function uploadFile(file: File) {
    setError(null);
    if (!address) {
      setError("Connect your wallet to upload.");
      return;
    }
    if (!SERVICE_IMAGE_MIME.has(file.type)) {
      setError("Use JPEG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > SERVICE_IMAGE_MAX_BYTES) {
      setError("Image must be under 2 MB.");
      return;
    }

    setBusy(true);
    try {
      const issuedAt = Math.floor(Date.now() / 1000);
      const challenge = buildUploadImageChallenge({
        owner_address: address,
        issuedAt,
      });
      const signature = await signMessageAsync({ message: challenge });
      const form = new FormData();
      form.set("file", file);
      form.set("owner_address", address);
      form.set("signature", signature);
      form.set("issuedAt", String(issuedAt));

      const res = await fetch("/api/services/image", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      onChange(typeof data.url === "string" ? data.url : null);
      setUrlDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function applyUrl() {
    setError(null);
    const trimmed = urlDraft.trim();
    if (!trimmed) {
      onChange(null);
      return;
    }
    if (!isValidServiceImageUrl(trimmed) || trimmed.startsWith("data:")) {
      setError("Paste a public https image link.");
      return;
    }
    onChange(trimmed);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-muted">
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BrandMark size="sm" className="border-0 shadow-none" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <button
            type="button"
            disabled={disabled || busy || !address}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void uploadFile(file);
            }}
            className={[
              "flex w-full flex-col items-start rounded-2xl border border-dashed px-4 py-3 text-left text-sm transition-colors",
              dragging
                ? "border-foreground bg-surface-muted"
                : "border-line bg-background hover:border-foreground/40",
              disabled || busy ? "opacity-60" : "",
            ].join(" ")}
          >
            <span className="font-medium text-foreground">
              {busy ? "Uploading…" : "Upload logo or cover"}
            </span>
            <span className="mt-0.5 text-xs text-muted">
              Drop a file or click — JPEG, PNG, WebP, GIF · max 2 MB
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={disabled || busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void uploadFile(file);
            }}
          />
          {value && (
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => {
                onChange(null);
                setUrlDraft("");
              }}
              className="text-xs font-medium text-muted underline underline-offset-4 hover:text-foreground"
            >
              Remove image
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1 space-y-1.5 text-sm">
          <span className="font-medium">Or paste image URL</span>
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            disabled={disabled || busy}
            placeholder="https://…"
            className="w-full rounded-2xl border border-line bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-foreground"
          />
        </label>
        <button
          type="button"
          disabled={disabled || busy || !urlDraft.trim()}
          onClick={applyUrl}
          className="h-10 shrink-0 rounded-2xl border border-line bg-surface px-4 text-sm font-medium disabled:opacity-40"
        >
          Use URL
        </button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
