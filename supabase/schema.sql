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


-- ---------------------------------------------------------------------------
-- App feedback (Feedback tab). Added later: safe to run again on an existing
-- project, it only creates what is missing.
--
-- Anyone using the app can SEND feedback, also from the demo without an
-- account. Nobody can read it through the app: only admins see it, in the
-- dashboard (Table Editor -> app_feedback).

create table if not exists public.app_feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  kind text not null check (kind in ('idea', 'problema', 'altro')),
  rating int check (rating between 1 and 5),
  message text not null check (char_length(message) between 1 and 2000),
  can_contact boolean not null default false
);

alter table public.app_feedback enable row level security;

drop policy if exists "Anyone can send feedback" on public.app_feedback;
create policy "Anyone can send feedback"
  on public.app_feedback for insert
  to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));
