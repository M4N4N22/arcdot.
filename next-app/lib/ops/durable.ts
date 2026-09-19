import { isSupabaseConfigured } from "@/lib/supabase/server";

/** Production (or explicit flag) requires Supabase for paid unlocks. */
export function requiresDurableStore(): boolean {
  if (process.env.REQUIRE_DURABLE_STORE === "true") return true;
  if (process.env.REQUIRE_DURABLE_STORE === "false") return false;
  return process.env.NODE_ENV === "production";
}

export function durableStoreReady(): boolean {
  return isSupabaseConfigured();
}

export function durableStoreBlocked(): boolean {
  return requiresDurableStore() && !durableStoreReady();
}
