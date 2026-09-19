import { createClient } from "@supabase/supabase-js";

/**
 * Returns true if the anon key can read secret service columns (privacy regression).
 * null = could not probe (no anon key / network).
 */
export async function probeAnonSystemPromptLeak(): Promise<boolean | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  try {
    const client = createClient(url, anon, {
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
