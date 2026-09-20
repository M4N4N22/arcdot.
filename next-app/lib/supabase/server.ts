import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseSecretKey,
  getSupabaseUrl,
  isSupabaseAdminConfigured,
  isSupabaseConfigured as envConfigured,
} from "@/lib/supabase/env";

export {
  describeSupabaseKeyMode,
  getSupabasePublishableKey,
  getSupabaseSecretKey,
  getSupabaseUrl,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/env";

let admin: SupabaseClient | null = null;

/** True when URL + publishable or secret key is present. */
export function isSupabaseConfigured(): boolean {
  return envConfigured();
}

/**
 * Server admin client — bypasses RLS.
 * Requires SUPABASE_SECRET_KEY (preferred) or legacy SUPABASE_SERVICE_ROLE_KEY.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (admin) return admin;
  const url = getSupabaseUrl();
  const key = getSupabaseSecretKey();
  if (!url || !key) {
    throw new Error(
      "Supabase admin is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY).",
    );
  }
  admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}
