-- arcdot. schema v2 (additive) — run after schema.sql
-- Durable replay protection, pause flag, sale economics

alter table public.services
  add column if not exists paused boolean not null default false;

alter table public.requests
  add column if not exists seller_address text,
  add column if not exists amount_wei text,
  add column if not exists seller_amount_wei text,
  add column if not exists platform_amount_wei text;

create index if not exists requests_seller_idx on public.requests (seller_address);

create table if not exists public.spent_payments (
  tx_hash text primary key,
  payment_id text,
  payer_address text not null,
  service_id uuid references public.services (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists spent_payments_payer_idx on public.spent_payments (payer_address);

alter table public.spent_payments enable row level security;

-- No public insert; service role writes from Next.js API
create policy "Public read spent_payments"
  on public.spent_payments for select
  using (true);
