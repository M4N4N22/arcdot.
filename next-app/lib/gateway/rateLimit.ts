/**
 * Rate limit: Supabase-backed when configured; process memory otherwise.
 */

import { durableStoreReady, requiresDurableStore } from "@/lib/ops/durable";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const globalStore = globalThis as typeof globalThis & {
  __arcdotRateLimit?: Map<string, number[]>;
};

function memoryBucket(): Map<string, number[]> {
  if (!globalStore.__arcdotRateLimit) {
    globalStore.__arcdotRateLimit = new Map();
  }
  return globalStore.__arcdotRateLimit;
}

function checkMemory(params: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const map = memoryBucket();
  const prev = (map.get(params.key) ?? []).filter((t) => now - t < params.windowMs);
  if (prev.length >= params.limit) {
    const oldest = prev[0] ?? now;
    return { ok: false, retryAfterMs: params.windowMs - (now - oldest) };
  }
  prev.push(now);
  map.set(params.key, prev);
  return { ok: true };
}

async function checkDurable(params: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
  const since = new Date(Date.now() - params.windowMs).toISOString();
  const admin = getSupabaseAdmin();

  const { count, error: countErr } = await admin
    .from("rate_limit_hits")
    .select("id", { count: "exact", head: true })
    .eq("bucket_key", params.key)
    .gte("created_at", since);

  if (countErr) throw countErr;

  if ((count ?? 0) >= params.limit) {
    return { ok: false, retryAfterMs: params.windowMs };
  }

  const { error: insertErr } = await admin.from("rate_limit_hits").insert({
    bucket_key: params.key,
  });
  if (insertErr) throw insertErr;

  // best-effort prune
  void admin
    .from("rate_limit_hits")
    .delete()
    .eq("bucket_key", params.key)
    .lt("created_at", since);

  return { ok: true };
}

export async function checkRateLimit(params: {
  key: string;
  limit?: number;
  windowMs?: number;
}): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
  const limit = params.limit ?? 30;
  const windowMs = params.windowMs ?? 60_000;

  if (durableStoreReady()) {
    try {
      return await checkDurable({ key: params.key, limit, windowMs });
    } catch (err) {
      console.error("durable rate limit failed", err);
      if (requiresDurableStore()) {
        return { ok: false, retryAfterMs: windowMs };
      }
    }
  } else if (requiresDurableStore()) {
    return { ok: false, retryAfterMs: windowMs };
  }

  return checkMemory({ key: params.key, limit, windowMs });
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
