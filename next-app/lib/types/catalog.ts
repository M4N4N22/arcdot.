export type ServiceStatus = "draft" | "published";

export interface ServiceRow {
  id: string;
  slug: string;
  owner_address: string;
  title: string;
  description: string;
  price_wei: string;
  price_usdc: string;
  system_prompt: string;
  status: ServiceStatus;
  paused: boolean;
  created_at: string;
}

export interface ProfileRow {
  wallet_address: string;
  display_name: string | null;
  bio: string | null;
  created_at: string;
}

export interface RequestRow {
  id: string;
  service_id: string | null;
  service_slug: string | null;
  payer_address: string;
  seller_address: string | null;
  tx_hash: string | null;
  payment_id: string | null;
  status: "paid" | "fulfilled" | "failed";
  prompt: string | null;
  response_preview: string | null;
  amount_wei: string | null;
  seller_amount_wei: string | null;
  platform_amount_wei: string | null;
  created_at: string;
}

export interface SpentPaymentRow {
  tx_hash: string;
  payment_id: string | null;
  payer_address: string;
  service_id: string | null;
  created_at: string;
}

/** Local seed when Supabase env is missing (dev / offline). */
export const LOCAL_SEED_SERVICES: ServiceRow[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "quick-brief",
    owner_address: "0x00000000000000000000000000000000000000a1",
    title: "Quick Brief",
    description: "Turn a messy question into a clear two-sentence brief.",
    price_wei: "10000000000000000",
    price_usdc: "0.01",
    system_prompt:
      "You are a concise briefing assistant. Reply in exactly two short sentences.",
    status: "published",
    paused: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    slug: "tone-polish",
    owner_address: "0x00000000000000000000000000000000000000a1",
    title: "Tone Polish",
    description: "Rewrite copy so it sounds calm, clear, and professional.",
    price_wei: "10000000000000000",
    price_usdc: "0.01",
    system_prompt:
      "You rewrite user text to be calm, clear, and professional. Return only the rewritten text.",
    status: "published",
    paused: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    slug: "agent-checklist",
    owner_address: "0x00000000000000000000000000000000000000a1",
    title: "Agent Checklist",
    description:
      "Produce a short actionable checklist for an autonomous agent task.",
    price_wei: "20000000000000000",
    price_usdc: "0.02",
    system_prompt:
      "You produce a short actionable checklist (5 bullets max) for the agent task described by the user.",
    status: "published",
    paused: false,
    created_at: new Date().toISOString(),
  },
];
