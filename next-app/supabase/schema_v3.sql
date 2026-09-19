-- arcdot. schema v3 (additive) — run after schema_v2.sql
-- Unlock credits, durable rate limits, seller webhooks, tighter RLS

-- One-time re-unlock after paid-but-failed upstream
create table if not exists public.unlock_credits (
  tx_hash text primary key,
  payer_address text not null,
  service_id uuid references public.services (id) on delete set null,
  service_slug text not null,
  payment_id text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists unlock_credits_payer_idx
  on public.unlock_credits (payer_address);

alter table public.unlock_credits enable row level security;
-- service role only (no public policies)

-- Durable rate-limit hits
create table if not exists public.rate_limit_hits (
  id bigserial primary key,
  bucket_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_key_created_idx
  on public.rate_limit_hits (bucket_key, created_at desc);

alter table public.rate_limit_hits enable row level security;

-- Seller webhook on profiles
alter table public.profiles
  add column if not exists webhook_url text;

-- Tighten requests: drop public read if present
drop policy if exists "Public read requests" on public.requests;

-- Column-level secrecy: anon/authenticated must not read system_prompt or webhook_url.
-- App catalog uses service role; this blocks direct Supabase anon leaks.

do $$
begin
  -- Profiles: public columns only (no webhook_url)
  revoke all on table public.profiles from anon, authenticated;
  grant select (
    wallet_address, display_name, bio, created_at
  ) on table public.profiles to anon, authenticated;

  -- Services: public catalog columns (no system_prompt)
  revoke all on table public.services from anon, authenticated;
  grant select (
    id, slug, owner_address, title, description,
    price_wei, price_usdc, status, paused, created_at
  ) on table public.services to anon, authenticated;
exception
  when undefined_object then
    -- roles may not exist outside Supabase — ignore
    null;
end $$;

-- spent_payments: keep public read for transparency or drop — leave as-is from v2
