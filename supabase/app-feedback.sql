-- FOODPULSE · Feedback tab table.
-- Run once in Supabase: SQL Editor -> New query -> paste this file -> Run.
-- Safe to run again: it only creates what is missing.
--
-- Every submission from the Feedback tab is one row. People using the app can only
-- SEND feedback (also from the demo, without an account); nobody can read it through
-- the app. Admins see it in the dashboard (Table Editor -> app_feedback) and with the
-- queries in supabase/dashboard-queries.sql (12-16).

create table if not exists public.app_feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  demo boolean not null default false,
  visual_rating int not null check (visual_rating between 1 and 5),
  preorder text not null check (char_length(preorder) <= 100),
  profile_banners text not null check (char_length(profile_banners) <= 100),
  discounts text not null check (char_length(discounts) <= 100),
  improvements text check (char_length(improvements) <= 2000)
);

alter table public.app_feedback enable row level security;

drop policy if exists "Anyone can send feedback" on public.app_feedback;
create policy "Anyone can send feedback"
  on public.app_feedback for insert
  to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));
