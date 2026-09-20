/**
 * Supabase API key resolution.
 *
 * Prefer the new keys (publishable / secret). Legacy anon / service_role
 * remain as fallbacks during migration — Supabase deprecates them end of 2026.
 *
 * @see https://supabase.com/docs/guides/getting-started/api-keys
 * @see https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys
 */

export function getSupabaseUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return url || undefined;
}

/** Public / browser key — publishable first, then legacy anon. */
export function getSupabasePublishableKey(): string | undefined {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return key || undefined;
}

/**
 * Server privileged key — secret first, then legacy service_role.
 * Never expose via NEXT_PUBLIC_*.
 */
export function getSupabaseSecretKey(): string | undefined {
  const key =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return key || undefined;
}

export function isSupabaseUrlConfigured(): boolean {
  return Boolean(getSupabaseUrl());
}

/** True when URL + a privileged server key are set (writes / admin). */
export function isSupabaseAdminConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseSecretKey());
}

/** True when URL + any usable key (publishable or secret) exist. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    getSupabaseUrl() && (getSupabaseSecretKey() || getSupabasePublishableKey()),
  );
}

export function describeSupabaseKeyMode(): {
  publishable: "publishable" | "anon" | "none";
  secret: "secret" | "service_role" | "none";
} {
  const pub =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
      ? "publishable"
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
        ? "anon"
        : "none";
  const secret = process.env.SUPABASE_SECRET_KEY?.trim()
    ? "secret"
    : process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
      ? "service_role"
      : "none";
  return { publishable: pub, secret };
}
