import { NextResponse } from "next/server";
import { createPublicClient, formatEther, http } from "viem";
import { ARC, promptGatewayAbi } from "@/lib/arc/constants";
import { isSupabaseConfigured, getSupabaseAdmin } from "@/lib/supabase/server";
import { getActiveArcChain } from "@/lib/wallet/arcChain";

export const runtime = "nodejs";

export async function GET() {
  const gateway =
    ARC.gatewayAddress && ARC.gatewayAddress.length === 42
      ? ARC.gatewayAddress
      : null;

  const out: Record<string, unknown> = {
    ok: true,
    chainId: ARC.chainId,
    gateway,
    rpcUrl: ARC.rpcUrl,
    explorerTxBase: ARC.explorerTxBase,
    minFeeUsdc: ARC.feeUsdc,
    minFeeWei: ARC.feeWei.toString(),
    platformFeeBps: ARC.platformFeeBps,
    demoUnlock:
      process.env.ALLOW_DEMO_UNLOCK === "true" ||
      (process.env.NODE_ENV !== "production" &&
        Boolean(process.env.DEMO_AGENT_SECRET)),
    pendingPlatformWei: null as string | null,
    pendingPlatformUsdc: null as string | null,
    verifiedRequests: null as number | null,
    blockNumber: null as string | null,
  };

  try {
    const client = createPublicClient({
      chain: getActiveArcChain(),
      transport: http(ARC.rpcUrl),
    });
    const block = await client.getBlockNumber();
    out.blockNumber = block.toString();

    if (gateway) {
      try {
        const pending = await client.readContract({
          address: gateway,
          abi: promptGatewayAbi,
          functionName: "pendingPlatform",
        });
        if (typeof pending === "bigint") {
          out.pendingPlatformWei = pending.toString();
          out.pendingPlatformUsdc = formatEther(pending);
        }
      } catch {
        // contract may be v1 without pendingPlatform
      }
    }
  } catch (err) {
    out.ok = false;
    out.rpcError = err instanceof Error ? err.message : "rpc failed";
  }

  if (isSupabaseConfigured()) {
    try {
      const { count, error } = await getSupabaseAdmin()
        .from("requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "fulfilled");
      if (!error) out.verifiedRequests = count ?? 0;
    } catch {
      out.verifiedRequests = null;
    }
  }

  return NextResponse.json(out);
}
