-- FOODPULSE · Supermarket dashboard: orders, store accounts, store codes.
-- Run once in Supabase: SQL Editor -> New query -> paste this file -> Run.
-- Safe to run again: it only creates what is missing and replaces the rules.
--
-- After this file, run the PRIVATE file with the store codes (it is not on GitHub,
-- because this repository is public). To change a code later: Table Editor -> store_codes.
--
-- How it fits together
--   orders       one row per booking. Customers create and see only their own; a supermarket
--                account sees and updates only the orders of its own store.
--   store_staff  which account works for which store (filled when someone enters a store code).
--   store_codes  the secret code of each store. Nobody can read this table through the app:
--                the code can only be checked by the function claim_store_code().

-- ---------- store codes and store accounts ----------

create table if not exists public.store_codes (
  code text primary key,
  store_id text not null,
  note text
);
alter table public.store_codes enable row level security;
-- no policies on purpose: the app can never read the codes

create table if not exists public.store_staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  store_id text not null,
  created_at timestamptz not null default now()
);
alter table public.store_staff enable row level security;

drop policy if exists "Staff can see their own store link" on public.store_staff;
create policy "Staff can see their own store link"
  on public.store_staff for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Checks a store code and links the logged-in account to that store. Returns the store id,
-- or null if the code is wrong.
create or replace function public.claim_store_code(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store text;
begin
  if auth.uid() is null then
    return null;
  end if;
  select store_id into v_store from public.store_codes where code = upper(trim(p_code));
  if v_store is null then
    return null;
  end if;
  insert into public.store_staff (user_id, store_id) values (auth.uid(), v_store)
  on conflict (user_id) do update set store_id = excluded.store_id;
  return v_store;
end;
$$;
revoke all on function public.claim_store_code(text) from public, anon;
grant execute on function public.claim_store_code(text) to authenticated;

-- ---------- orders ----------

create table if not exists public.orders (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  store_id text not null,
  code text not null,
  customer_name text not null default '',
  lines jsonb not null default '[]'::jsonb,
  total numeric(10, 2) not null default 0,
  pickup_date date not null,
  slot text not null default '',
  method text not null default 'instore',
  pickup_detail text not null default '',
  notes text check (char_length(notes) <= 500),
  status text not null default 'da_preparare'
    check (status in ('da_preparare', 'in_preparazione', 'pronto', 'completato', 'annullato')),
  seen_by_store boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_store_idx on public.orders (store_id, created_at desc);
create index if not exists orders_code_idx on public.orders (code);
alter table public.orders enable row level security;

-- customers
drop policy if exists "Customers create their own orders" on public.orders;
create policy "Customers create their own orders"
  on public.orders for insert
  to authenticated
  with check (user_id = (select auth.uid()) and status = 'da_preparare' and not seen_by_store);

drop policy if exists "Customers see their own orders" on public.orders;
create policy "Customers see their own orders"
  on public.orders for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Customers can cancel their own orders" on public.orders;
create policy "Customers can cancel their own orders"
  on public.orders for update
  to authenticated
  using (user_id = (select auth.uid()) and status in ('da_preparare', 'in_preparazione', 'pronto'))
  with check (user_id = (select auth.uid()) and status = 'annullato');

-- supermarkets
drop policy if exists "Stores see their orders" on public.orders;
create policy "Stores see their orders"
  on public.orders for select
  to authenticated
  using (store_id in (select s.store_id from public.store_staff s where s.user_id = (select auth.uid())));

drop policy if exists "Stores update their orders" on public.orders;
create policy "Stores update their orders"
  on public.orders for update
  to authenticated
  using (store_id in (select s.store_id from public.store_staff s where s.user_id = (select auth.uid())))
  with check (store_id in (select s.store_id from public.store_staff s where s.user_id = (select auth.uid())));

-- ---------- handy queries for the team ----------
-- All orders, newest first:
--   select created_at, store_id, code, customer_name, status, total from orders order by created_at desc;
-- Which accounts are linked to which store:
--   select u.email, s.store_id, s.created_at from store_staff s join auth.users u on u.id = s.user_id;
-- Remove a supermarket account's access:
--   delete from store_staff where user_id = (select id from auth.users where email = 'name@example.com');

-- Checks a store code before signing up (true/false only; does not reveal the store).
create or replace function public.store_code_exists(p_code text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.store_codes where code = upper(trim(p_code)));
$$;
revoke all on function public.store_code_exists(text) from public;
grant execute on function public.store_code_exists(text) to anon, authenticated;
