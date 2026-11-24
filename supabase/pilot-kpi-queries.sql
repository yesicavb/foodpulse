-- FOODPULSE · PILOT KPIs for the Supabase SQL Editor
--
-- Quickest: query 0 (KPI OVERVIEW) shows every KPI in one table.
-- How to use: SQL Editor -> New query -> paste ONE query (from "-- C1." or "-- S1." up to the next one) -> Run.
-- Click "Save" with the query's name so the team can reuse it.
--
-- Pilot start: 25 Nov 2026. To measure another period, change the date in the line "where start ..." of a query.
-- Only the partner shops count (the test store and the demo are never included: demo data is not stored in Supabase).
-- KPIs 1-3 for customers (new visitors, registration rate, engagement time) come from Google Analytics,
-- filtered on account_type = "registered". C1b below gives the sign-ups from Supabase as a check.


-- 0. KPI OVERVIEW: all pilot KPIs in one table (one row per KPI). Paste this whole query and click Run.
--    Save it as "00 · Pilot KPI overview" so it sits at the top of the saved queries.
--    Customer KPIs 1-3 (visitors, registration rate, engagement time) come from Google Analytics.
with p as (select date '2026-11-25' as start),
shops as (select id, name from public.partner_stores where catalog is not null),
o as (select o.* from public.orders o, p where o.created_at >= p.start and o.store_id in (select id from shops)),
cust as (select u.id, u.created_at, u.last_sign_in_at from auth.users u where u.id not in (select user_id from public.store_staff)),
ratings as (
  select (f->'ratings'->>'overall')::numeric as stars
  from public.user_data d
  cross join lateral jsonb_array_elements(coalesce(d.data->'feedbacks', '[]'::jsonb)) f
  join o on o.id = f->>'orderId'
  where f->'ratings' ? 'overall'
),
sf as (select f.* from public.store_feedback f, p where f.created_at >= p.start and f.store_id in (select id from shops))
select * from (values
  ('C0', 'Customers', 'New customer sign-ups',              (select count(*)::text from cust, p where cust.created_at >= p.start)),
  ('C4', 'Customers', 'Average booking lead time (days)',   (select coalesce(round(avg(pickup_date - (created_at at time zone 'Europe/Rome')::date), 1)::text, '-') from o)),
  ('C5', 'Customers', 'Order conversion rate (%)',          (select coalesce(round(100.0 * (select count(distinct user_id) from o) / nullif((select count(*) from cust, p where cust.last_sign_in_at >= p.start), 0), 1)::text, '-'))),
  ('C6', 'Customers', 'Customer satisfaction (1-5)',        (select coalesce(round(avg(stars), 2)::text, '-') || ' (' || count(*) || ' ratings)' from ratings)),
  ('C7', 'Customers', 'Average order value (€)',            (select coalesce(round(avg(total), 2)::text, '-') from o where status <> 'annullato')),
  ('C8', 'Customers', 'Collected orders',                   (select count(*)::text from o where status = 'completato')),
  ('S1', 'Shops',     'New retailer accounts',              (select count(*)::text from public.store_staff s, p where s.created_at >= p.start and s.store_id in (select id from shops))),
  ('S2', 'Shops',     'Confirmed pre-orders (all shops)',   (select count(*)::text from o)),
  ('S3', 'Shops',     'Pickup rate (%)',                    (select coalesce(round(100.0 * count(*) filter (where status = 'completato') / nullif(count(*), 0), 1)::text, '-') from o)),
  ('S4', 'Shops',     'Cancellation rate (%)',              (select coalesce(round(100.0 * count(*) filter (where status = 'annullato') / nullif(count(*), 0), 1)::text, '-') from o)),
  ('S5', 'Shops',     'Preparation time (minutes)',         (select coalesce(round(avg(extract(epoch from (ready_at - created_at)) / 60))::text, '-') from o where ready_at is not null)),
  ('S6', 'Shops',     'Revenue via FoodPulse (€)',          (select coalesce(sum(total), 0)::text from o where status = 'completato')),
  ('S7', 'Shops',     'Active shops in the last 7 days',    (select count(distinct store_id)::text from o where created_at >= now() - interval '7 days')),
  ('S8', 'Shops',     'Retailer satisfaction (1-5)',        (select coalesce(round(avg(rating), 2)::text, '-') || ' (' || count(*) || ' ratings)' from sf where rating is not null))
) as k(code, side, kpi, value)
order by code;


-- ======================= CUSTOMERS (C) =======================

-- C1b. New customer sign-ups (Supabase check for GA KPIs 1-2): registered accounts that are not shop staff
with p as (select date '2026-11-25' as start)
select count(*) as new_customers
from auth.users u, p
where u.created_at >= p.start
  and u.id not in (select user_id from public.store_staff);


-- C4. Average booking lead time: days between booking and pickup date
with p as (select date '2026-11-25' as start)
select round(avg(o.pickup_date - (o.created_at at time zone 'Europe/Rome')::date), 1) as avg_days_ahead,
       count(*)                                                                    as bookings
from public.orders o, p
where o.created_at >= p.start
  and o.store_id in (select id from public.partner_stores where catalog is not null);


-- C5. Order conversion rate: customers with at least one booking ÷ customers who logged in, × 100
with p as (select date '2026-11-25' as start),
active as (
  select u.id from auth.users u, p
  where u.last_sign_in_at >= p.start
    and u.id not in (select user_id from public.store_staff)
),
booked as (
  select distinct o.user_id from public.orders o, p
  where o.created_at >= p.start
    and o.store_id in (select id from public.partner_stores where catalog is not null)
)
select (select count(*) from active)                                   as customers_logged_in,
       (select count(*) from booked)                                   as customers_who_booked,
       round(100.0 * (select count(*) from booked) / nullif((select count(*) from active), 0), 1) as conversion_pct;


-- C6. Customer satisfaction: average of the 1-5 "overall" stars given after a pickup at a partner shop
with p as (select date '2026-11-25' as start)
select round(avg((f->'ratings'->>'overall')::numeric), 2) as avg_stars,
       count(*)                                           as ratings
from public.user_data d
cross join lateral jsonb_array_elements(coalesce(d.data->'feedbacks', '[]'::jsonb)) f
join public.orders o on o.id = f->>'orderId'
cross join p
where (f->>'date')::date >= p.start
  and f->'ratings' ? 'overall'
  and o.store_id in (select id from public.partner_stores where catalog is not null);


-- C7. Average order value (€), cancelled bookings left out
with p as (select date '2026-11-25' as start)
select round(avg(o.total), 2) as avg_order_value_eur,
       count(*)               as orders
from public.orders o, p
where o.created_at >= p.start
  and o.status <> 'annullato'
  and o.store_id in (select id from public.partner_stores where catalog is not null);


-- C8. Collected orders: bookings the shop confirmed by scanning the QR
with p as (select date '2026-11-25' as start)
select count(*) as collected_orders
from public.orders o, p
where o.created_at >= p.start
  and o.status = 'completato'
  and o.store_id in (select id from public.partner_stores where catalog is not null);


-- ======================= SHOPS (S) =======================

-- S1. New retailer accounts: shop staff accounts linked to a partner shop in the period
with p as (select date '2026-11-25' as start)
select ps.name as shop, count(*) as new_staff_accounts
from public.store_staff s
join public.partner_stores ps on ps.id = s.store_id
cross join p
where s.created_at >= p.start and ps.catalog is not null
group by ps.name
order by new_staff_accounts desc;


-- S2-S4 and S6. Per shop: confirmed pre-orders, pickup rate, cancellation rate, revenue via FoodPulse
with p as (select date '2026-11-25' as start)
select ps.name                                                                               as shop,
       count(*)                                                                              as pre_orders,
       count(*) filter (where o.status = 'completato')                                       as picked_up,
       round(100.0 * count(*) filter (where o.status = 'completato') / nullif(count(*), 0), 1) as pickup_rate_pct,
       round(100.0 * count(*) filter (where o.status = 'annullato') / nullif(count(*), 0), 1)  as cancellation_rate_pct,
       coalesce(sum(o.total) filter (where o.status = 'completato'), 0)                      as revenue_eur
from public.orders o
join public.partner_stores ps on ps.id = o.store_id
cross join p
where o.created_at >= p.start and ps.catalog is not null
group by ps.name
order by pre_orders desc;


-- S5. Preparation time: average minutes from "order received" to "ready for pickup", per shop
--     (only orders after pilot.sql was run have the "ready" time)
with p as (select date '2026-11-25' as start)
select ps.name                                                              as shop,
       round(avg(extract(epoch from (o.ready_at - o.created_at)) / 60))      as avg_minutes_to_ready,
       count(*)                                                             as orders_measured
from public.orders o
join public.partner_stores ps on ps.id = o.store_id
cross join p
where o.created_at >= p.start and o.ready_at is not null and ps.catalog is not null
group by ps.name
order by ps.name;


-- S7. Active shops per week: shops with at least one booking that week
with p as (select date '2026-11-25' as start)
select date_trunc('week', o.created_at)::date as week,
       count(distinct o.store_id)             as active_shops
from public.orders o, p
where o.created_at >= p.start
  and o.store_id in (select id from public.partner_stores where catalog is not null)
group by 1
order by 1;


-- S8. Retailer satisfaction per shop: average pickup stars and average "how easy is the dashboard" (weekly, Q1)
with p as (select date '2026-11-25' as start)
select ps.name                                                              as shop,
       round(avg(f.rating) filter (where f.kind = 'pickup'), 2)             as avg_pickup_stars,
       count(*) filter (where f.kind = 'pickup')                            as pickup_ratings,
       round(avg(f.rating) filter (where f.kind = 'weekly'), 2)             as avg_dashboard_ease,
       count(*) filter (where f.kind = 'weekly')                            as weekly_answers
from public.store_feedback f
join public.partner_stores ps on ps.id = f.store_id
cross join p
where f.created_at >= p.start
group by ps.name
order by ps.name;


-- ======================= EXTRA =======================

-- X1. Weekly shop answers in full, newest first (questions 2-5 as text)
select f.created_at::date            as date,
       ps.name                       as shop,
       f.rating                      as q1_dashboard_ease,
       f.answers->>'orders_clear'    as q2_orders_clear,
       f.answers->>'prep_time'       as q3_prep_time,
       f.answers->>'helped'          as q4_helped,
       f.answers->>'improve'         as q5_improve
from public.store_feedback f
join public.partner_stores ps on ps.id = f.store_id
where f.kind = 'weekly'
order by f.created_at desc;


-- X2. The same pickup rated by both sides: customer stars vs shop stars, per order
select o.id                                       as order_id,
       ps.name                                    as shop,
       o.pickup_date,
       (c.f->'ratings'->>'overall')::int          as customer_stars,
       s.rating                                   as shop_stars
from public.orders o
join public.partner_stores ps on ps.id = o.store_id
left join lateral (
  select f from public.user_data d
  cross join lateral jsonb_array_elements(coalesce(d.data->'feedbacks', '[]'::jsonb)) f
  where d.user_id = o.user_id and f->>'orderId' = o.id
  limit 1
) c on true
left join public.store_feedback s on s.order_id = o.id and s.kind = 'pickup'
where o.status = 'completato'
order by o.pickup_date desc;
