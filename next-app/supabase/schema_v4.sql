-- arcdot. schema v4 (additive) — seller-owned upstream fulfillment
-- Run after schema_v3.sql

alter table public.services
  add column if not exists upstream_url text;

alter table public.services
  add column if not exists upstream_bearer text;

-- Anon/authenticated: public catalog may see upstream_url presence via app;
-- never expose upstream_bearer (or system_prompt).
do $$
begin
  revoke all on table public.services from anon, authenticated;
  grant select (
    id, slug, owner_address, title, description,
    price_wei, price_usdc, status, paused, created_at,
    upstream_url
  ) on table public.services to anon, authenticated;
exception
  when undefined_object then
    null;
end $$;
