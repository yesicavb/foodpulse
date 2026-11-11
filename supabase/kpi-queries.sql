-- FOODPULSE · MVP KPI queries for the Supabase SQL Editor
--
-- How to use: SQL Editor -> New query -> paste ONE query (from "-- K1." up to the next one) -> Run.
-- Click "Save" and give it the name in its title, so the whole team can rerun it every week.
--
-- These are the team's MVP KPIs, calculated from what the app already stores:
-- every account (auth.users) and every booking in user_data. Cancelled bookings
-- ("annullato") never count. The demo account is never stored in Supabase.
-- Each query shows the raw counts next to the percentage ("4 of 11"),
-- because with few users a percentage on its own is misleading.
--
-- "Pre-Order Conversion" (users who browse the fresh products -> users who book)
-- is not here: browsing is not stored in Supabase. It comes from Google Analytics.


-- K1. Activation Rate per weekly cohort
--     = users with a first booking / new registered users x 100
--     One row per sign-up week, so newer groups can be compared with older ones.
with users as (
  select u.id,
         date_trunc('week', u.created_at)::date as cohort_week,
         (select count(*)
            from jsonb_array_elements(coalesce(d.data->'orders', '[]'::jsonb)) o
           where o->>'status' <> 'annullato') as bookings
  from auth.users u
  left join user_data d on d.user_id = u.id
)
select cohort_week,
       count(*)                                         as new_users,
       count(*) filter (where bookings >= 1)            as activated,
       round(100.0 * count(*) filter (where bookings >= 1) / count(*), 1) as activation_rate_pct
from users
group by cohort_week
order by cohort_week;


-- K2. Average Lead Time  (days booked in advance)
--     = sum of advance days / number of bookings
--     Overall, then per week the booking was made.
select date_trunc('week', (o->>'createdAt')::timestamptz)::date as week,
       count(*)                                                  as bookings,
       round(avg((o->>'advance')::numeric), 2)                   as avg_lead_time_days
from user_data d,
     jsonb_array_elements(d.data->'orders') o
where o->>'status' <> 'annullato'
group by rollup (week)
order by week nulls last;   -- the last row (week empty) is the overall average


-- K3. Repeat Pre-Order Rate
--     = users with at least 2 bookings / users with at least 1 booking x 100
with per_user as (
  select d.user_id,
         count(*) as bookings
  from user_data d,
       jsonb_array_elements(d.data->'orders') o
  where o->>'status' <> 'annullato'
  group by d.user_id
)
select count(*)                                   as users_with_1_or_more,
       count(*) filter (where bookings >= 2)      as users_with_2_or_more,
       round(100.0 * count(*) filter (where bookings >= 2) / nullif(count(*), 0), 1) as repeat_rate_pct
from per_user;


-- K4. Discount Effectiveness: bookings per discount level
--     The level follows from the days booked in advance: 1 day = 5%, 3 days = 10%, 5 days = 15%.
--     Note: every user sees all three levels at once, so this shows which level people
--     CHOOSE, not which one works best. That needs an A/B test (see the team chat).
select case
         when (o->>'advance')::int >= 5 then '15% (5+ giorni)'
         when (o->>'advance')::int >= 3 then '10% (3-4 giorni)'
         when (o->>'advance')::int >= 1 then '5% (1-2 giorni)'
         else '0% (stesso giorno)'
       end                                                       as discount_level,
       count(*)                                                  as bookings,
       round(100.0 * count(*) / sum(count(*)) over (), 1)        as share_pct,
       round(avg((o->>'total')::numeric), 2)                     as avg_basket_eur
from user_data d,
     jsonb_array_elements(d.data->'orders') o
where o->>'status' <> 'annullato'
group by discount_level
order by min((o->>'advance')::int);


-- K5. User Satisfaction  (average post-shopping rating, 1-5)
--     From the survey a user fills in after a completed pickup.
--     One row per question, plus "overall" for the general experience.
select q.key                                  as question,
       count(*)                               as answers,
       round(avg(q.value::numeric), 2)        as avg_rating_1_to_5
from user_data d,
     jsonb_array_elements(coalesce(d.data->'feedbacks', '[]'::jsonb)) f,
     jsonb_each_text(f->'ratings') q
where q.value ~ '^[0-9]+$' and q.value::int between 1 and 5
group by q.key
order by question;


-- K6. All KPIs at a glance  (one row; for the weekly metrics tracker)
with users as (
  select u.id,
         (select count(*)
            from jsonb_array_elements(coalesce(d.data->'orders', '[]'::jsonb)) o
           where o->>'status' <> 'annullato') as bookings
  from auth.users u
  left join user_data d on d.user_id = u.id
),
orders as (
  select o
  from user_data d,
       jsonb_array_elements(d.data->'orders') o
  where o->>'status' <> 'annullato'
),
ratings as (
  select (f->'ratings'->>'overall')::numeric as overall
  from user_data d,
       jsonb_array_elements(coalesce(d.data->'feedbacks', '[]'::jsonb)) f
  where f->'ratings'->>'overall' ~ '^[1-5]$'
)
select (select count(*) from users)                                   as registered_users,
       (select count(*) from users where bookings >= 1)               as users_with_booking,
       (select round(100.0 * count(*) filter (where bookings >= 1) / nullif(count(*), 0), 1) from users) as activation_rate_pct,
       (select count(*) from users where bookings >= 2)               as users_with_2_bookings,
       (select round(100.0 * count(*) filter (where bookings >= 2) / nullif(count(*) filter (where bookings >= 1), 0), 1) from users) as repeat_rate_pct,
       (select count(*) from orders)                                  as total_bookings,
       (select round(avg((o->>'advance')::numeric), 2) from orders)  as avg_lead_time_days,
       (select count(*) from orders where o->>'status' = 'completato') as bookings_picked_up,
       (select count(*) from ratings)                                 as satisfaction_answers,
       (select round(avg(overall), 2) from ratings)                   as avg_satisfaction_1_to_5;
