-- FOODPULSE database setup.
-- Run once in Supabase: SQL Editor -> New query -> paste this file -> Run.
--
-- One row per user holds that user's whole app state (profile, cart, orders,
-- points, vouchers) as JSON. Row Level Security makes sure every user can
-- only read and write their own row.

create table if not exists public.user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

drop policy if exists "Users can read their own data" on public.user_data;
create policy "Users can read their own data"
  on public.user_data for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own data" on public.user_data;
create policy "Users can create their own data"
  on public.user_data for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own data" on public.user_data;
create policy "Users can update their own data"
  on public.user_data for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
