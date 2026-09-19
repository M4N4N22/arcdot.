-- arcdot. Supabase schema
-- Run this in the Supabase SQL editor after creating your project.

create extension if not exists "pgcrypto";

-- Profiles (wallet = identity)
create table if not exists public.profiles (
  wallet_address text primary key,
  display_name text,
  bio text,
  created_at timestamptz not null default now()
);

-- Payable API services (catalog)
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  owner_address text not null,
  title text not null,
  description text not null default '',
  price_wei text not null,
  price_usdc text not null,
  system_prompt text not null default '',
  status text not null default 'published'
    check (status in ('draft', 'published')),
  paused boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists services_status_idx on public.services (status);
create index if not exists services_owner_idx on public.services (owner_address);

-- Paid request history
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services (id) on delete set null,
  service_slug text,
  payer_address text not null,
  tx_hash text,
  payment_id text,
  status text not null default 'paid'
    check (status in ('paid', 'fulfilled', 'failed')),
  prompt text,
  response_preview text,
  created_at timestamptz not null default now()
);

create index if not exists requests_payer_idx on public.requests (payer_address);
create index if not exists requests_created_idx on public.requests (created_at desc);

-- RLS: public read for published catalog + profiles; writes via service role from Next.js
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.requests enable row level security;

create policy "Public read profiles"
  on public.profiles for select
  using (true);

create policy "Public read published services"
  on public.services for select
  using (status = 'published');

create policy "Public read requests"
  on public.requests for select
  using (true);

-- Seed demo services (platform-owned placeholder owner)
insert into public.profiles (wallet_address, display_name, bio)
values (
  '0x00000000000000000000000000000000000000a1',
  'arcdot.',
  'Official demo services for the payable API gateway.'
)
on conflict (wallet_address) do nothing;

insert into public.services (
  slug, owner_address, title, description, price_wei, price_usdc, system_prompt, status
) values
(
  'quick-brief',
  '0x00000000000000000000000000000000000000a1',
  'Quick Brief',
  'Turn a messy question into a clear two-sentence brief.',
  '10000000000000000',
  '0.01',
  'You are a concise briefing assistant. Reply in exactly two short sentences.',
  'published'
),
(
  'tone-polish',
  '0x00000000000000000000000000000000000000a1',
  'Tone Polish',
  'Rewrite copy so it sounds calm, clear, and professional.',
  '10000000000000000',
  '0.01',
  'You rewrite user text to be calm, clear, and professional. Return only the rewritten text.',
  'published'
),
(
  'agent-checklist',
  '0x00000000000000000000000000000000000000a1',
  'Agent Checklist',
  'Produce a short actionable checklist for an autonomous agent task.',
  '20000000000000000',
  '0.02',
  'You produce a short actionable checklist (5 bullets max) for the agent task described by the user.',
  'published'
)
on conflict (slug) do nothing;
