/** Format Arc native USDC wei (18 decimals) for UI — never show raw wei. */

export function formatUsdcWei(wei: bigint | string | null | undefined): string {
  if (wei === null || wei === undefined || wei === "") return "0.00";
  const value = typeof wei === "bigint" ? wei : BigInt(wei);
  const whole = value / BigInt(10 ** 18);
  const frac = value % BigInt(10 ** 18);
  const fracStr = frac.toString().padStart(18, "0").slice(0, 4);
  return `${whole}.${fracStr}`;
}

export function statusLabel(
  status: "paid" | "fulfilled" | "failed" | string,
): string {
  if (status === "fulfilled") return "Delivered";
  if (status === "paid") return "Paid";
  if (status === "failed") return "Failed";
  return status;
}
