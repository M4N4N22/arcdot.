import { createClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

/**
 * Returns true if the publishable (or legacy anon) key can read secret
 * service columns (privacy regression). null = could not probe.
 */
export async function probeAnonSystemPromptLeak(): Promise<boolean | null> {
  const url = getSupabaseUrl();
  const publishable = getSupabasePublishableKey();
  if (!url || !publishable) return null;

  try {
    const client = createClient(url, publishable, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client
      .from("services")
      .select("system_prompt, upstream_bearer")
      .eq("status", "published")
      .limit(1)
      .maybeSingle();

    if (error) {
      // column privilege / RLS denial → good
      const msg = error.message?.toLowerCase() ?? "";
      if (
        msg.includes("permission") ||
        msg.includes("denied") ||
        msg.includes("column") ||
        error.code === "42501" ||
        error.code === "42703"
      ) {
        return false;
      }
      return null;
    }

    if (
      data &&
      (("system_prompt" in data && data.system_prompt != null) ||
        ("upstream_bearer" in data && data.upstream_bearer != null))
    ) {
      return true;
    }
    return false;
  } catch {
    return null;
  }
}
