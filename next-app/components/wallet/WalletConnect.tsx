"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { formatEther } from "viem";
import { useBalance } from "wagmi";
import { ARC_MAINNET_CHAIN_ID } from "@/lib/arc/network";
import { arcMainnet } from "@/lib/wallet/arcChain";

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatUsdc(value: bigint | undefined): string {
  if (value === undefined) return "—";
  const n = Number(formatEther(value));
  if (!Number.isFinite(n)) return "—";
  if (n >= 100) return n.toFixed(2);
  if (n >= 1) return n.toFixed(3);
  if (n >= 0.01) return n.toFixed(4);
  if (n === 0) return "0";
  return n.toFixed(6);
}

const btnBase =
  "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20";

function NetworkBadge({
  ok,
  label,
}: {
  ok: boolean;
  label: string;
}) {
  return (
    <span
      className={[
        "inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium tracking-tight",
        ok
          ? "border-line bg-surface-muted text-foreground"
          : "border-amber-700/25 bg-amber-50 text-amber-950",
      ].join(" ")}
      title={ok ? "Arc Mainnet" : "Switch to Arc Mainnet"}
    >
      <span
        className={[
          "h-1.5 w-1.5 shrink-0 rounded-full",
          ok ? "bg-lime-400" : "bg-amber-600",
        ].join(" ")}
        aria-hidden
      />
      {label}
    </span>
  );
}

function BalanceChip({
  address,
  chainId,
}: {
  address?: `0x${string}`;
  chainId?: number;
}) {
  const { data } = useBalance({
    address,
    chainId: ARC_MAINNET_CHAIN_ID,
    query: {
      enabled: Boolean(address) && chainId === ARC_MAINNET_CHAIN_ID,
      refetchInterval: 15_000,
    },
  });

  const onMainnet = chainId === ARC_MAINNET_CHAIN_ID;

  return (
    <span
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 text-[12px] font-medium text-foreground"
      title={onMainnet ? "Native USDC on Arc Mainnet" : "Connect to Arc Mainnet to see balance"}
    >
      <Image
        src="/brand/usdc-token-128.png"
        alt=""
        width={14}
        height={14}
        className="rounded-full"
      />
      <span className="tabular-nums">
        {onMainnet ? formatUsdc(data?.value) : "—"}
      </span>
      <span className="text-muted">USDC</span>
    </span>
  );
}

type WalletConnectProps = {
  /** Compact for headers; default shows network + balance. */
  compact?: boolean;
  className?: string;
};

/**
 * Branded wallet control — Arc Mainnet only.
 * Shows network label + native USDC balance above / beside the connect action.
 */
export function WalletConnect({
  compact = false,
  className = "",
}: WalletConnectProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        const onArcMainnet = chain?.id === ARC_MAINNET_CHAIN_ID;
        const networkLabel = !connected
          ? "Mainnet"
          : onArcMainnet
            ? "Mainnet"
            : chain?.name?.toLowerCase().includes("test")
              ? "Testnet"
              : "Wrong network";

        return (
          <div
            className={[
              compact
                ? "flex flex-wrap items-center justify-end gap-1.5"
                : "flex flex-col items-end gap-1.5",
              !ready ? "opacity-0 pointer-events-none" : "opacity-100",
              className,
            ].join(" ")}
            aria-hidden={!ready}
          >
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <NetworkBadge
                ok={!connected || onArcMainnet}
                label={networkLabel}
              />
              {connected ? (
                <BalanceChip
                  address={account.address as `0x${string}`}
                  chainId={chain.id}
                />
              ) : null}
            </div>

            {!connected ? (
              <button
                type="button"
                onClick={openConnectModal}
                className={`${btnBase} border-transparent bg-foreground text-accent-foreground hover:opacity-90`}
              >
                Connect wallet
              </button>
            ) : !onArcMainnet ? (
              <button
                type="button"
                onClick={() => openChainModal?.() ?? openConnectModal()}
                className={`${btnBase} border-amber-700/30 bg-foreground text-accent-foreground hover:opacity-90`}
              >
                Switch to Arc Mainnet
              </button>
            ) : (
              <button
                type="button"
                onClick={openAccountModal}
                className={`${btnBase} border-line bg-surface text-foreground hover:bg-surface-muted`}
              >
                <span className="font-mono text-[12px]">
                  {shortenAddress(account.address)}
                </span>
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

/** Ensure switch modal only offers Arc Mainnet (wagmi chains already locked). */
export const WALLET_CHAIN = arcMainnet;
