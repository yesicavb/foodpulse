-- Customer transactional mail. Run after store-dashboard.sql.
-- Existing retailer webhook/function is unchanged.
create table if not exists public.customer_order_mail (
  order_id text not null references public.orders(id) on delete cascade,
  event text not null check (event in ('da_preparare','in_preparazione','pronto','reminder')),
  due_at timestamptz not null default now(),
  sent_at timestamptz,
  claimed_at timestamptz,
  attempts integer not null default 0,
  primary key (order_id,event)
);
alter table public.customer_order_mail enable row level security;
revoke all on public.customer_order_mail from anon, authenticated;
grant select,insert,update,delete on public.customer_order_mail to service_role;

create or replace function public.customer_pickup_time(p_date date,p_slot text)
returns timestamptz language plpgsql stable set search_path = '' as $$
declare t text[];
begin
  t := regexp_match(p_slot, '^\s*([0-9]{1,2}):([0-9]{2})');
  if t is null or t[1]::int > 23 or t[2]::int > 59 then return null; end if;
  return (p_date + make_time(t[1]::int,t[2]::int,0)) at time zone 'Europe/Rome';
end $$;

create or replace function public.queue_customer_order_mail()
returns trigger language plpgsql security definer set search_path = '' as $$
declare pickup timestamptz;
begin
  if TG_OP = 'INSERT' then
    if new.status = 'da_preparare' then
      insert into public.customer_order_mail(order_id,event) values(new.id,new.status) on conflict do nothing;
    end if;
  elsif new.status is distinct from old.status and new.status in ('in_preparazione','pronto') then
    insert into public.customer_order_mail(order_id,event) values(new.id,new.status) on conflict do nothing;
  end if;
  if new.status in ('da_preparare','in_preparazione','pronto') and new.method = 'instore' then
    pickup := public.customer_pickup_time(new.pickup_date,new.slot);
    if pickup > now() then
      insert into public.customer_order_mail(order_id,event,due_at)
        values(new.id,'reminder',greatest(now(),pickup - interval '1 hour'))
        on conflict(order_id,event) do update set due_at=excluded.due_at
        where customer_order_mail.sent_at is null and customer_order_mail.claimed_at is null;
    end if;
  end if;
  if new.status in ('completato','annullato') then
    delete from public.customer_order_mail where order_id=new.id and sent_at is null;
  end if;
  return new;
end $$;
revoke all on function public.queue_customer_order_mail() from public,anon,authenticated;
drop trigger if exists queue_customer_order_mail on public.orders;
create trigger queue_customer_order_mail after insert or update of status,pickup_date,slot,method on public.orders
for each row execute function public.queue_customer_order_mail();

-- Backfill only future reminders, not historical status emails.
insert into public.customer_order_mail(order_id,event,due_at)
select id,'reminder',greatest(now(),public.customer_pickup_time(pickup_date,slot)-interval '1 hour')
from public.orders where status in ('da_preparare','in_preparazione','pronto') and method='instore'
and public.customer_pickup_time(pickup_date,slot)>now()
on conflict do nothing;

create or replace function public.claim_customer_order_mail()
returns setof public.customer_order_mail language sql security definer set search_path = '' as $$
  update public.customer_order_mail q set claimed_at=now(), attempts=q.attempts+1
  where (q.order_id,q.event) in (
    select m.order_id,m.event from public.customer_order_mail m
    where m.sent_at is null and m.due_at<=now() and m.attempts<10
      and (m.claimed_at is null or m.claimed_at<now()-interval '10 minutes')
    order by m.due_at limit 20 for update skip locked
  ) returning q.*;
$$;
revoke all on function public.claim_customer_order_mail() from public,anon,authenticated;
grant execute on function public.claim_customer_order_mail() to service_role;

-- Schedule the Edge Function every minute after deploying it.
-- Use Supabase Vault secrets named customer_mail_url (full function URL)
-- and customer_mail_token (same random secret as CUSTOMER_MAIL_TOKEN in Edge Functions).
-- Enable pg_cron and pg_net first. Never commit actual credentials.
-- Run the following in SQL Editor after configuring the secrets:
-- select cron.schedule('foodpulse-customer-mail','* * * * *',
-- $$select net.http_post(
-- url := (select decrypted_secret from vault.decrypted_secrets where name='customer_mail_url'),
-- headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='customer_mail_token')),
-- body := '{}'::jsonb, timeout_milliseconds := 55000);$$);
