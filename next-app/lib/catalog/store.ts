import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  LOCAL_SEED_SERVICES,
  type RequestRow,
  type ServiceRow,
} from "@/lib/types/catalog";

const memoryServices: ServiceRow[] = [...LOCAL_SEED_SERVICES];
const memoryRequests: RequestRow[] = [];
const memorySpent = new Set<string>();

function withPausedDefault(row: ServiceRow): ServiceRow {
  return { ...row, paused: Boolean(row.paused) };
}

export async function listPublishedServices(): Promise<ServiceRow[]> {
  if (!isSupabaseConfigured()) {
    return memoryServices
      .filter((s) => s.status === "published" && !s.paused)
      .map(withPausedDefault);
  }
  const { data, error } = await getSupabaseAdmin()
    .from("services")
    .select("*")
    .eq("status", "published")
    .eq("paused", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ServiceRow[]).map(withPausedDefault);
}

export async function listServicesForOwner(
  ownerAddress: string,
): Promise<ServiceRow[]> {
  if (!isSupabaseConfigured()) {
    return memoryServices
      .filter(
        (s) => s.owner_address.toLowerCase() === ownerAddress.toLowerCase(),
      )
      .map(withPausedDefault);
  }
  const { data, error } = await getSupabaseAdmin()
    .from("services")
    .select("*")
    .eq("owner_address", ownerAddress.toLowerCase())
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ServiceRow[]).map(withPausedDefault);
}

export async function getServiceBySlug(
  slug: string,
): Promise<ServiceRow | null> {
  if (!isSupabaseConfigured()) {
    const found = memoryServices.find((s) => s.slug === slug) ?? null;
    return found ? withPausedDefault(found) : null;
  }
  const { data, error } = await getSupabaseAdmin()
    .from("services")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? withPausedDefault(data as ServiceRow) : null;
}

export async function createService(
  input: Omit<ServiceRow, "id" | "created_at">,
): Promise<ServiceRow> {
  if (!isSupabaseConfigured()) {
    const row: ServiceRow = {
      ...input,
      paused: input.paused ?? false,
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
      paused: input.paused ?? false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return withPausedDefault(data as ServiceRow);
}

export async function updateService(
  slug: string,
  ownerAddress: string,
  patch: Partial<
    Pick<
      ServiceRow,
      | "title"
      | "description"
      | "price_wei"
      | "price_usdc"
      | "system_prompt"
      | "paused"
      | "status"
    >
  >,
): Promise<ServiceRow> {
  if (!isSupabaseConfigured()) {
    const idx = memoryServices.findIndex((s) => s.slug === slug);
    if (idx < 0) throw new Error("Service not found");
    if (
      memoryServices[idx].owner_address.toLowerCase() !==
      ownerAddress.toLowerCase()
    ) {
      throw new Error("Not owner");
    }
    memoryServices[idx] = { ...memoryServices[idx], ...patch };
    return memoryServices[idx];
  }
  const { data, error } = await getSupabaseAdmin()
    .from("services")
    .update(patch)
    .eq("slug", slug)
    .eq("owner_address", ownerAddress.toLowerCase())
    .select("*")
    .single();
  if (error) throw error;
  return withPausedDefault(data as ServiceRow);
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
      seller_address: row.seller_address?.toLowerCase() ?? null,
      tx_hash: row.tx_hash,
      payment_id: row.payment_id,
      status: row.status,
      prompt: row.prompt,
      response_preview: row.response_preview,
      amount_wei: row.amount_wei,
      seller_amount_wei: row.seller_amount_wei,
      platform_amount_wei: row.platform_amount_wei,
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

export async function listRequestsForSeller(
  address: string,
): Promise<RequestRow[]> {
  if (!isSupabaseConfigured()) {
    return memoryRequests.filter(
      (r) =>
        (r.seller_address ?? "").toLowerCase() === address.toLowerCase(),
    );
  }
  const { data, error } = await getSupabaseAdmin()
    .from("requests")
    .select("*")
    .eq("seller_address", address.toLowerCase())
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as RequestRow[];
}

/**
 * Atomically mark a tx as spent. Returns false if already consumed.
 */
export async function tryMarkSpentPayment(params: {
  txHash: string;
  paymentId?: string;
  payerAddress: string;
  serviceId?: string | null;
}): Promise<boolean> {
  const key = params.txHash.toLowerCase();

  if (!isSupabaseConfigured()) {
    if (memorySpent.has(key)) return false;
    memorySpent.add(key);
    return true;
  }

  const { error } = await getSupabaseAdmin().from("spent_payments").insert({
    tx_hash: key,
    payment_id: params.paymentId ?? null,
    payer_address: params.payerAddress.toLowerCase(),
    service_id: params.serviceId ?? null,
  });

  if (error) {
    // unique violation
    if (
      error.code === "23505" ||
      error.message?.toLowerCase().includes("duplicate")
    ) {
      return false;
    }
    throw error;
  }
  return true;
}

export async function isSpentPayment(txHash: string): Promise<boolean> {
  const key = txHash.toLowerCase();
  if (!isSupabaseConfigured()) return memorySpent.has(key);
  const { data, error } = await getSupabaseAdmin()
    .from("spent_payments")
    .select("tx_hash")
    .eq("tx_hash", key)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function pingSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await getSupabaseAdmin()
    .from("services")
    .select("id")
    .limit(1);
  return !error;
}
