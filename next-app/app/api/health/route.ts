import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { ARC } from "@/lib/arc/constants";
import { pingSupabase } from "@/lib/catalog/store";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { arcMainnet } from "@/lib/wallet/arcChain";

export const runtime = "nodejs";

export async function GET() {
  const checks: Record<string, unknown> = {
    ok: true,
    chainId: ARC.chainId,
    gatewayConfigured: Boolean(
      ARC.gatewayAddress && ARC.gatewayAddress.length === 42,
    ),
    gatewayAddress: ARC.gatewayAddress || null,
    supabaseConfigured: isSupabaseConfigured(),
    demoUnlock:
      process.env.ALLOW_DEMO_UNLOCK === "true" ||
      (process.env.NODE_ENV !== "production" &&
        Boolean(process.env.DEMO_AGENT_SECRET)),
  };

  try {
    const client = createPublicClient({
      chain: arcMainnet,
      transport: http(ARC.rpcUrl),
    });
    const block = await client.getBlockNumber();
    checks.rpcOk = true;
    checks.blockNumber = block.toString();
  } catch (err) {
    checks.ok = false;
    checks.rpcOk = false;
    checks.rpcError = err instanceof Error ? err.message : "rpc failed";
  }

  if (isSupabaseConfigured()) {
    checks.supabaseOk = await pingSupabase();
    if (!checks.supabaseOk) checks.ok = false;
  } else {
    checks.supabaseOk = null;
  }

  return NextResponse.json(checks, {
    status: checks.ok ? 200 : 503,
  });
}
