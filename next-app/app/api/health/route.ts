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
import {
  describeSupabaseKeyMode,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { getActiveArcChain } from "@/lib/wallet/arcChain";

export const runtime = "nodejs";

export async function GET() {
  const durableStore = durableStoreReady();
  const keyMode = describeSupabaseKeyMode();
  const chain = getActiveArcChain();
  const checks: Record<string, unknown> = {
    ok: true,
    protocol: "arcdot.gateway",
    catalog: "/api/services",
    unlock: "/api/gateway",
    mcp: "/api/mcp",
    wellKnown: {
      plugin: "/.well-known/ai-plugin.json",
      agent: "/.well-known/arcdot.json",
      openapi: "/.well-known/openapi.json",
    },
    arcNetwork: ARC.network,
    chainId: ARC.chainId,
    gatewayConfigured: Boolean(
      ARC.gatewayAddress && ARC.gatewayAddress.length === 42,
    ),
    gatewayAddress: ARC.gatewayAddress || null,
    supabaseConfigured: isSupabaseConfigured(),
    supabaseAdminConfigured: isSupabaseAdminConfigured(),
    supabaseKeyMode: keyMode,
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
      chain,
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

  if (isSupabaseAdminConfigured()) {
    checks.supabaseOk = await pingSupabase();
    if (!checks.supabaseOk) checks.ok = false;
  } else {
    checks.supabaseOk = null;
    if (isSupabaseConfigured() && !isSupabaseAdminConfigured()) {
      checks.supabaseWarning =
        "Publishable key present but SUPABASE_SECRET_KEY missing — paid unlocks need the secret key";
    }
  }

  const promptLeak = await probeAnonSystemPromptLeak();
  checks.publishableSystemPromptReadable = promptLeak;
  checks.anonSystemPromptReadable = promptLeak; // legacy alias
  if (promptLeak === true && requiresDurableStore()) {
    checks.ok = false;
    checks.privacyError =
      "Publishable key can read system_prompt or upstream_bearer — apply schema_v3/v4 column grants";
  }

  return NextResponse.json(checks, {
    status: checks.ok ? 200 : 503,
  });
}
