import { formatEther } from "viem";
import type { WalletStatus } from "./status.js";
import {
  fundUrlFor,
  WALLET_STATUS_CMD,
} from "./guide.js";

/** Round USDC for human copy (avoid long float strings). */
export function formatUsdcDisplay(usdc: string | number): string {
  const n = typeof usdc === "number" ? usdc : Number(usdc);
  if (!Number.isFinite(n)) return String(usdc);
  if (n === 0) return "0";
  if (n >= 1) return n.toFixed(2).replace(/\.?0+$/, "");
  return n.toFixed(4).replace(/\.?0+$/, "");
}

/**
 * Plain-language fund instructions for Cursor / agents to relay to humans.
 * Always include a clickable /fund deep link with the address prefilled.
 */
export function formatFundsNeededMessage(params: {
  status: WalletStatus;
  requiredWei: bigint;
  /** arcdot host — used to deep-link /fund */
  origin?: string;
  serviceSlug?: string;
}): { text: string; payload: Record<string, unknown> } {
  const need = formatUsdcDisplay(formatEther(params.requiredWei));
  const have = formatUsdcDisplay(params.status.balanceUsdc);
  const networkLabel =
    params.status.network === "testnet" ? "Arc testnet" : "Arc";
  const fundUrl = fundUrlFor(
    params.origin ?? "",
    params.status.address,
  );
  const serviceBit = params.serviceSlug
    ? ` for “${params.serviceSlug}”`
    : "";

  const text = [
    `Payment needed${serviceBit}: your agent wallet has ${have} USDC on Arc but this unlock costs ${need} USDC on ${networkLabel}.`,
    "",
    "For you (human):",
    `1. Open ${fundUrl} (QR + live balance).`,
    `2. Send at least 0.05 USDC on ${networkLabel} (USDC on Arc only — not Ethereum, Base, or other chains) to:`,
    `   ${params.status.address}`,
    "3. After the balance updates, say you’re funded so we can retry — do not invent an answer.",
    "",
    "HOST AGENT (Cursor / IDE) — do this next for smooth UX:",
    `→ Open or show this link prominently: ${fundUrl}`,
    `→ Optionally run (with user approval): ${WALLET_STATUS_CMD}`,
    "→ When funded, retry arcdot_unlock with the same args.",
    "",
    `Explorer: ${params.status.explorerUrl}`,
  ].join("\n");

  const payload = {
    error: "INSUFFICIENT_FUNDS",
    userMessage: text,
    address: params.status.address,
    balanceUsdc: have,
    requiredUsdc: need,
    network: params.status.network,
    chainId: params.status.chainId,
    explorerUrl: params.status.explorerUrl,
    fundUrl,
    statusCommand: WALLET_STATUS_CMD,
    hostAgent: {
      action: "open_fund_url_then_retry",
      fundUrl,
      optionalShell: WALLET_STATUS_CMD,
      then: ["retry_arcdot_unlock"],
    },
    next: `Open ${fundUrl}, fund the wallet, then retry arcdot_unlock.`,
  };

  return { text, payload };
}
