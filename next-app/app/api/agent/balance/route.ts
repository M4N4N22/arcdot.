import { NextResponse } from "next/server";
import { formatEther, isAddress } from "viem";
import { z } from "zod";
import { ARC } from "@/lib/arc/constants";
import { getArcExplorerAddressBase } from "@/lib/arc/network";
import { getArcClient } from "@/lib/arc/verifyPayment";

export const runtime = "nodejs";

/** Default warning line — enough for a few unlocks at the 0.01 USDC floor. */
const DEFAULT_LOW_BALANCE_USDC = 0.05;

const querySchema = z.object({
  address: z
    .string()
    .refine((v) => isAddress(v), "Invalid address"),
});

/**
 * Public balance lookup for an agent wallet address.
 * Never accepts or returns private keys — Hub funding panel only.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    address: url.searchParams.get("address") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide a valid 0x wallet address." },
      { status: 400 },
    );
  }

  const address = parsed.data.address as `0x${string}`;
  const thresholdRaw = Number(
    process.env.ARCDOT_LOW_BALANCE_USDC ?? DEFAULT_LOW_BALANCE_USDC,
  );
  const alertThresholdUsdc =
    Number.isFinite(thresholdRaw) && thresholdRaw >= 0
      ? thresholdRaw
      : DEFAULT_LOW_BALANCE_USDC;

  try {
    const client = getArcClient();
    const wei = await client.getBalance({ address });
    const balanceUsdc = formatEther(wei);
    const thresholdWei = BigInt(Math.round(alertThresholdUsdc * 1e18));
    const lowBalance = wei < thresholdWei;
    const explorerUrl = `${getArcExplorerAddressBase()}${address}`;

    return NextResponse.json({
      address,
      balanceUsdc,
      balanceWei: wei.toString(),
      lowBalance,
      alertThresholdUsdc,
      network: ARC.network,
      chainId: ARC.chainId,
      explorerUrl,
      fundHint: lowBalance
        ? `Send USDC on Arc (${ARC.network}) to this address. Keep at least ${alertThresholdUsdc} USDC available. USDC on other networks will not appear.`
        : null,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not read balance on Arc.",
      },
      { status: 502 },
    );
  }
}
