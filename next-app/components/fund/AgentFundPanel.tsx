"use client";

import { useCallback, useEffect, useState } from "react";
import { isAddress } from "viem";
import { CopyButton } from "@/components/hub/CopyButton";

export const AGENT_WALLET_ADDRESS_KEY = "arcdot.hub.agentWalletAddress";

type BalancePayload = {
  address: string;
  balanceUsdc: string;
  lowBalance: boolean;
  alertThresholdUsdc: number;
  network: string;
  chainId: number;
  explorerUrl: string;
  fundHint: string | null;
};

function qrUrl(address: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${encodeURIComponent(address)}`;
}

type AgentFundPanelProps = {
  /** Prefill from /fund?address=0x… (MCP deep link) */
  initialAddress?: string | null;
};

/** Shared fund UI — Hub wallet + /fund. Address only; never a private key. */
export function AgentFundPanel({ initialAddress }: AgentFundPanelProps) {
  const [addressInput, setAddressInput] = useState("");
  const [savedAddress, setSavedAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<BalancePayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fromQuery =
      initialAddress?.trim() && isAddress(initialAddress.trim())
        ? initialAddress.trim()
        : null;
    if (fromQuery) {
      setAddressInput(fromQuery);
      setSavedAddress(fromQuery);
      try {
        localStorage.setItem(AGENT_WALLET_ADDRESS_KEY, fromQuery);
      } catch {
        // ignore
      }
      return;
    }
    try {
      const stored = localStorage.getItem(AGENT_WALLET_ADDRESS_KEY)?.trim() ?? "";
      if (stored && isAddress(stored)) {
        setSavedAddress(stored);
        setAddressInput(stored);
      }
    } catch {
      // ignore
    }
  }, [initialAddress]);

  const refreshBalance = useCallback(async (address: string) => {
    if (!isAddress(address)) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(
        `/api/agent/balance?address=${encodeURIComponent(address)}`,
      );
      const json = (await res.json()) as BalancePayload & { error?: string };
      if (!res.ok) {
        setBalance(null);
        setLoadError(json.error || "Could not load balance.");
        return;
      }
      setBalance(json);
    } catch {
      setBalance(null);
      setLoadError("Could not reach the balance check.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (savedAddress) void refreshBalance(savedAddress);
  }, [savedAddress, refreshBalance]);

  function saveAddress() {
    const next = addressInput.trim();
    if (!isAddress(next)) {
      setLoadError(
        "Enter a valid address from wallet create or wallet address.",
      );
      return;
    }
    try {
      localStorage.setItem(AGENT_WALLET_ADDRESS_KEY, next);
    } catch {
      // ignore
    }
    setSavedAddress(next);
    setLoadError(null);
  }

  function clearAddress() {
    try {
      localStorage.removeItem(AGENT_WALLET_ADDRESS_KEY);
    } catch {
      // ignore
    }
    setSavedAddress(null);
    setBalance(null);
    setAddressInput("");
    setLoadError(null);
  }

  const funded =
    balance && !balance.lowBalance && Number(balance.balanceUsdc) > 0;

  return (
    <div className="rounded-xl border border-line bg-surface p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1 text-sm">
          <span className="text-[13px] font-medium text-foreground">
            Agent wallet address
          </span>
          <input
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveAddress();
            }}
            placeholder="0x…"
            spellCheck={false}
            className="mt-1.5 w-full rounded-lg border border-line bg-background px-3 py-2.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-foreground"
          />
        </label>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={saveAddress}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-surface hover:opacity-90"
          >
            Save &amp; check
          </button>
          {savedAddress && (
            <button
              type="button"
              onClick={clearAddress}
              className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-sm text-muted hover:bg-surface-muted hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loadError && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      )}

      {savedAddress ? (
        <div className="mt-5 grid gap-5 border-t border-line pt-5 sm:grid-cols-[168px_1fr] sm:items-start">
          <div className="mx-auto rounded-lg border border-line bg-background p-2 sm:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl(savedAddress)}
              alt={`QR code for ${savedAddress}`}
              width={168}
              height={168}
              className="h-[168px] w-[168px]"
            />
          </div>

          <div className="min-w-0 space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Receive address
              </p>
              <p className="mt-1.5 break-all font-mono text-[13px] text-foreground">
                {savedAddress}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton
                  value={savedAddress}
                  label="Copy address"
                  variant="soft"
                  className="rounded-lg"
                />
                {balance?.explorerUrl && (
                  <a
                    href={balance.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center rounded-lg border border-line px-3.5 text-xs font-semibold text-foreground hover:bg-surface-muted"
                  >
                    View on explorer
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => void refreshBalance(savedAddress)}
                  disabled={loading}
                  className="inline-flex h-9 items-center rounded-lg border border-line px-3.5 text-xs font-semibold text-foreground hover:bg-surface-muted disabled:opacity-50"
                >
                  {loading ? "Checking…" : "Refresh"}
                </button>
              </div>
            </div>

            <div
              className={[
                "rounded-lg px-4 py-3",
                funded
                  ? "border border-line bg-background"
                  : "border border-amber-200/80 bg-amber-50/80",
              ].join(" ")}
            >
              {loading && !balance ? (
                <p className="text-sm text-muted">Reading balance on Arc…</p>
              ) : balance ? (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Available
                  </p>
                  <p className="mt-1 font-display text-2xl tracking-tight text-foreground">
                    {Number(balance.balanceUsdc).toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}{" "}
                    <span className="text-base text-muted">USDC</span>
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {balance.network}
                    {funded
                      ? " · ready to spend"
                      : ` · needs at least ${balance.alertThresholdUsdc} USDC`}
                  </p>
                  {!funded && (
                    <p className="mt-2 text-sm text-foreground">
                      Send USDC on Arc to the address above, then hit Refresh.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted">
                  Balance unavailable — try Refresh after funding.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-muted">
          Save an address to show a QR code and live balance here.
        </p>
      )}
    </div>
  );
}
