import { formatEther } from "viem";
import {
  ARC_MAINNET_EXPLORER,
  ARC_TESTNET_EXPLORER,
  getArcChainId,
  getArcNetwork,
  type ArcNetworkId,
} from "../constants.js";
import { getNativeBalance } from "../settle/pay.js";
import {
  resolvePrivateKey,
  walletAccountFromKey,
} from "./store.js";

/** Default warning line: enough for a few unlocks at the 0.01 USDC floor. */
export const DEFAULT_LOW_BALANCE_USDC = 0.05;

export type WalletStatus = {
  address: `0x${string}`;
  balanceWei: string;
  balanceUsdc: string;
  lowBalance: boolean;
  alertThresholdUsdc: number;
  network: ArcNetworkId;
  chainId: number;
  explorerUrl: string;
  fundHint: string;
};

function alertThresholdUsdc(): number {
  const raw = process.env.ARCDOT_LOW_BALANCE_USDC?.trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return DEFAULT_LOW_BALANCE_USDC;
}

function explorerAddressUrl(
  address: `0x${string}`,
  network: ArcNetworkId,
): string {
  const base =
    network === "testnet" ? ARC_TESTNET_EXPLORER : ARC_MAINNET_EXPLORER;
  return `${base.replace(/\/$/, "")}/address/${address}`;
}

export function fundHintFor(
  address: `0x${string}`,
  network: ArcNetworkId,
): string {
  const chainLabel =
    network === "testnet" ? "Arc Testnet (5042002)" : "Arc Mainnet (5042)";
  return `Send native USDC on ${chainLabel} to ${address}. Keep at least ${alertThresholdUsdc()} USDC for runtime spend.`;
}

/** Balance + low-balance flag for the local buyer wallet (key never leaves this process). */
export async function getWalletStatus(opts?: {
  rpcUrl?: string;
  chainId?: number;
  address?: `0x${string}`;
}): Promise<WalletStatus> {
  const network = getArcNetwork();
  const chainId = opts?.chainId ?? getArcChainId(network);
  const address =
    opts?.address ?? walletAccountFromKey(resolvePrivateKey()).address;
  const { wei, formatted } = await getNativeBalance(address, {
    rpcUrl: opts?.rpcUrl,
    chainId,
  });
  const threshold = alertThresholdUsdc();
  const thresholdWei = BigInt(Math.round(threshold * 1e18));
  const lowBalance = wei < thresholdWei;
  const explorerUrl = explorerAddressUrl(address, network);

  return {
    address,
    balanceWei: wei.toString(),
    balanceUsdc: formatted,
    lowBalance,
    alertThresholdUsdc: threshold,
    network,
    chainId,
    explorerUrl,
    fundHint: fundHintFor(address, network),
  };
}

export function formatWalletStatusHuman(status: WalletStatus): string {
  const flag = status.lowBalance ? "LOW BALANCE" : "OK";
  return [
    `Address:  ${status.address}`,
    `Balance:  ${status.balanceUsdc} USDC (${flag})`,
    `Network:  ${status.network} · chain ${status.chainId}`,
    `Alert if below ${status.alertThresholdUsdc} USDC`,
    `Explorer: ${status.explorerUrl}`,
    status.lowBalance ? `Fund:     ${status.fundHint}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatUsdcFromWei(wei: bigint): string {
  return formatEther(wei);
}
