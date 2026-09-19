/**
 * Simple per-IP sliding window rate limit (process-local).
 * Durable enough for single-region Vercel warm instances; not a cluster lock.
 */

const globalStore = globalThis as typeof globalThis & {
  __arcdotRateLimit?: Map<string, number[]>;
};

function bucket(): Map<string, number[]> {
  if (!globalStore.__arcdotRateLimit) {
    globalStore.__arcdotRateLimit = new Map();
  }
  return globalStore.__arcdotRateLimit;
}

export function checkRateLimit(params: {
  key: string;
  limit?: number;
  windowMs?: number;
}): { ok: true } | { ok: false; retryAfterMs: number } {
  const limit = params.limit ?? 30;
  const windowMs = params.windowMs ?? 60_000;
  const now = Date.now();
  const map = bucket();
  const prev = (map.get(params.key) ?? []).filter((t) => now - t < windowMs);
  if (prev.length >= limit) {
    const oldest = prev[0] ?? now;
    return { ok: false, retryAfterMs: windowMs - (now - oldest) };
  }
  prev.push(now);
  map.set(params.key, prev);
  return { ok: true };
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
