-- FOODPULSE · PILOT setup. Run once in Supabase (SQL Editor -> New query -> paste -> Run),
-- after store-dashboard.sql and partner-stores.sql. Safe to run again.
-- Then run the PRIVATE file that links each partner shop (by its store code) to its catalogue.

-- 1. Which catalogue each partner shop sells (products and prices are in src/data/pilot.ts)
alter table public.partner_stores add column if not exists catalog text;

-- 2. When an order became "ready" and "picked up" (for the KPI "preparation time")
alter table public.orders add column if not exists ready_at timestamptz;
alter table public.orders add column if not exists completed_at timestamptz;

create or replace function public.orders_status_times()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'pronto' and new.ready_at is null then new.ready_at := now(); end if;
    if new.status = 'completato' and new.completed_at is null then new.completed_at := now(); end if;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_status_times on public.orders;
create trigger orders_status_times
  before update on public.orders
  for each row execute function public.orders_status_times();

-- 3. Feedback from the shops: stars after each pickup ('pickup') and the 5 weekly questions ('weekly')
create table if not exists public.store_feedback (
  id uuid primary key default gen_random_uuid(),
  store_id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('pickup', 'weekly')),
  order_id text,
  rating int check (rating between 1 and 5),
  answers jsonb,
  created_at timestamptz not null default now()
);
alter table public.store_feedback enable row level security;

drop policy if exists "Shop staff add feedback for their shop" on public.store_feedback;
create policy "Shop staff add feedback for their shop"
  on public.store_feedback for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and store_id in (select s.store_id from public.store_staff s where s.user_id = (select auth.uid()))
  );

drop policy if exists "Shop staff read their shop's feedback" on public.store_feedback;
create policy "Shop staff read their shop's feedback"
  on public.store_feedback for select
  to authenticated
  using (store_id in (select s.store_id from public.store_staff s where s.user_id = (select auth.uid())));

grant select, insert on public.store_feedback to authenticated;
