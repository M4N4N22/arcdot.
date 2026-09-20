import type { RequestRow } from "@/lib/types/catalog";

const ZERO_TX =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

/**
 * Demo / Activity rehearsal unlocks are written to `requests` for UX, but they
 * never call depositPayment — so they must not imply withdrawable USDC.
 */
export function isRehearsalRequest(row: RequestRow): boolean {
  const tx = (row.tx_hash ?? "").toLowerCase();
  const payer = (row.payer_address ?? "").toLowerCase();
  return (
    payer === "demo" ||
    payer === ZERO_ADDR ||
    tx === "" ||
    tx === ZERO_TX
  );
}

export function isOnChainSale(row: RequestRow): boolean {
  return !isRehearsalRequest(row) && row.status === "fulfilled";
}
