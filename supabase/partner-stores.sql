-- FOODPULSE · New partner stores registered with a "free" store code.
-- Run once in Supabase (SQL Editor -> New query -> paste -> Run), AFTER store-dashboard.sql.
-- Safe to run again. Then run the PRIVATE file with the free codes (not on GitHub: this repo is public).
--
-- How it works
--   A free code is a row in store_codes with no store_id yet. When a shop owner registers with it,
--   claim_new_store() creates the shop in partner_stores, ties the code to it and links the account.
--   From then on the code works like any store code (more staff of the same shop can use it).
--   partner_stores is readable by everyone, so customers see the shop in the app.

alter table public.store_codes alter column store_id drop not null;
alter table public.store_codes add column if not exists used_at timestamptz;

create table if not exists public.partner_stores (
  id text primary key,
  name text not null check (char_length(name) between 2 and 80),
  address text not null check (char_length(address) between 3 and 120),
  city text not null check (char_length(city) between 2 and 60),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.partner_stores enable row level security;

drop policy if exists "Everyone can see partner stores" on public.partner_stores;
create policy "Everyone can see partner stores"
  on public.partner_stores for select
  to anon, authenticated
  using (true);
grant select on public.partner_stores to anon, authenticated;

-- 'free' = code not used yet (new shop), 'store' = code of an existing store, null = wrong code
create or replace function public.store_code_kind(p_code text)
returns text
language sql
security definer
set search_path = public
as $$
  select case when store_id is null then 'free' else 'store' end
  from public.store_codes where code = upper(trim(p_code));
$$;
revoke all on function public.store_code_kind(text) from public;
grant execute on function public.store_code_kind(text) to anon, authenticated;

-- Creates the shop for a free code and links the logged-in account to it. Returns the new store id,
-- the existing store id if the code was already used, or null if the code is wrong.
create or replace function public.claim_new_store(p_code text, p_name text, p_address text, p_city text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(p_code));
  v_store text;
  v_found boolean;
begin
  if auth.uid() is null then
    return null;
  end if;
  select true, store_id into v_found, v_store from public.store_codes where code = v_code for update;
  if v_found is null then
    return null;
  end if;
  if v_store is null then
    v_store := 'pt-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12);
    insert into public.partner_stores (id, name, address, city, created_by)
    values (v_store, trim(p_name), trim(p_address), initcap(trim(p_city)), auth.uid());
    update public.store_codes set store_id = v_store, used_at = now(), note = trim(p_name) where code = v_code;
  end if;
  insert into public.store_staff (user_id, store_id) values (auth.uid(), v_store)
  on conflict (user_id) do update set store_id = excluded.store_id;
  return v_store;
end;
$$;
revoke all on function public.claim_new_store(text, text, text, text) from public, anon;
grant execute on function public.claim_new_store(text, text, text, text) to authenticated;
