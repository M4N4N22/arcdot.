-- arcdot. schema v5 (additive) — public tool cover / logo
-- Run after schema_v4.sql

alter table public.services
  add column if not exists image_url text;

-- Public catalog may read image_url; never expose secrets.
do $$
begin
  revoke all on table public.services from anon, authenticated;
  grant select (
    id, slug, owner_address, title, description,
    price_wei, price_usdc, status, paused, created_at,
    upstream_url, image_url
  ) on table public.services to anon, authenticated;
exception
  when undefined_object then
    null;
end $$;

-- Storage bucket for tool logos (create once in Supabase dashboard or via API).
-- Bucket id: service-images
-- Public read; uploads only via service-role (this app’s API).
--
-- insert into storage.buckets (id, name, public)
-- values ('service-images', 'service-images', true)
-- on conflict (id) do update set public = true;
