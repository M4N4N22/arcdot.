import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  LOCAL_SEED_SERVICES,
  type RequestRow,
  type ServiceRow,
} from "@/lib/types/catalog";

const memoryServices: ServiceRow[] = [...LOCAL_SEED_SERVICES];
const memoryRequests: RequestRow[] = [];

export async function listPublishedServices(): Promise<ServiceRow[]> {
  if (!isSupabaseConfigured()) {
    return memoryServices.filter((s) => s.status === "published");
  }
  const { data, error } = await getSupabaseAdmin()
    .from("services")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ServiceRow[];
}

export async function getServiceBySlug(
  slug: string,
): Promise<ServiceRow | null> {
  if (!isSupabaseConfigured()) {
    return memoryServices.find((s) => s.slug === slug) ?? null;
  }
  const { data, error } = await getSupabaseAdmin()
    .from("services")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as ServiceRow | null;
}

export async function createService(
  input: Omit<ServiceRow, "id" | "created_at">,
): Promise<ServiceRow> {
  if (!isSupabaseConfigured()) {
    const row: ServiceRow = {
      ...input,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    memoryServices.unshift(row);
    return row;
  }
  const { data, error } = await getSupabaseAdmin()
    .from("services")
    .insert({
      slug: input.slug,
      owner_address: input.owner_address.toLowerCase(),
      title: input.title,
      description: input.description,
      price_wei: input.price_wei,
      price_usdc: input.price_usdc,
      system_prompt: input.system_prompt,
      status: input.status,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as ServiceRow;
}

export async function upsertProfile(params: {
  wallet_address: string;
  display_name?: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await getSupabaseAdmin().from("profiles").upsert({
    wallet_address: params.wallet_address.toLowerCase(),
    display_name: params.display_name ?? null,
  });
  if (error) throw error;
}

export async function insertRequest(
  row: Omit<RequestRow, "id" | "created_at">,
): Promise<RequestRow> {
  if (!isSupabaseConfigured()) {
    const created: RequestRow = {
      ...row,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    memoryRequests.unshift(created);
    return created;
  }
  const { data, error } = await getSupabaseAdmin()
    .from("requests")
    .insert({
      service_id: row.service_id,
      service_slug: row.service_slug,
      payer_address: row.payer_address.toLowerCase(),
      tx_hash: row.tx_hash,
      payment_id: row.payment_id,
      status: row.status,
      prompt: row.prompt,
      response_preview: row.response_preview,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as RequestRow;
}

export async function listRequestsForPayer(
  address: string,
): Promise<RequestRow[]> {
  if (!isSupabaseConfigured()) {
    return memoryRequests.filter(
      (r) => r.payer_address.toLowerCase() === address.toLowerCase(),
    );
  }
  const { data, error } = await getSupabaseAdmin()
    .from("requests")
    .select("*")
    .eq("payer_address", address.toLowerCase())
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as RequestRow[];
}
