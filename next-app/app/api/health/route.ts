import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { ARC } from "@/lib/arc/constants";
import { pingSupabase } from "@/lib/catalog/store";
import {
  durableStoreBlocked,
  durableStoreReady,
  requiresDurableStore,
} from "@/lib/ops/durable";
import { probeAnonSystemPromptLeak } from "@/lib/ops/privacy";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { arcMainnet } from "@/lib/wallet/arcChain";

export const runtime = "nodejs";

export async function GET() {
  const durableStore = durableStoreReady();
  const checks: Record<string, unknown> = {
    ok: true,
    protocol: "arcdot.gateway",
    catalog: "/api/services",
    unlock: "/api/gateway",
    wellKnown: {
      plugin: "/.well-known/ai-plugin.json",
      agent: "/.well-known/arcdot.json",
      openapi: "/.well-known/openapi.json",
    },
    chainId: ARC.chainId,
    gatewayConfigured: Boolean(
      ARC.gatewayAddress && ARC.gatewayAddress.length === 42,
    ),
    gatewayAddress: ARC.gatewayAddress || null,
    supabaseConfigured: isSupabaseConfigured(),
    durableStore,
    requiresDurableStore: requiresDurableStore(),
    demoUnlock:
      process.env.ALLOW_DEMO_UNLOCK === "true" ||
      (process.env.NODE_ENV !== "production" &&
        Boolean(process.env.DEMO_AGENT_SECRET)),
  };

  if (durableStoreBlocked()) {
    checks.ok = false;
    checks.durableStoreError = "Supabase required for paid unlocks";
  }

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

  const promptLeak = await probeAnonSystemPromptLeak();
  checks.anonSystemPromptReadable = promptLeak;
  if (promptLeak === true && requiresDurableStore()) {
    checks.ok = false;
    checks.privacyError =
      "Anon can read system_prompt — apply schema_v3 column grants";
  }

  return NextResponse.json(checks, {
    status: checks.ok ? 200 : 503,
  });
}
