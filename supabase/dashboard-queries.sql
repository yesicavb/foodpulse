-- FOODPULSE · insight queries for the Supabase SQL Editor
--
-- How to use: SQL Editor -> New query -> paste ONE query (from "-- 1." up to the next one) -> Run.
-- Switch the result from "Results" to "Chart" to see it as a chart.
-- Click "Save" and give it the name shown in its title, so other admins can reuse it.
--
-- Cancelled bookings ("annullato") are left out unless a query says otherwise.
-- The demo account is never stored in Supabase, so only real sign-ups are counted.


-- 1. New sign-ups per day  (chart: bar, x = day, y = sign_ups)
select date(created_at) as day,
       count(*)         as sign_ups
from auth.users
group by day
order by day;


-- 2. Bookings over time, per week  (chart: line, x = week, y = bookings)
select date_trunc('week', (o->>'createdAt')::timestamptz)::date as week,
       count(*)                                                as bookings,
       round(sum((o->>'total')::numeric), 2)                   as revenue_eur
from user_data d,
     jsonb_array_elements(d.data->'orders') o
where o->>'status' <> 'annullato'
group by week
order by week;


-- 3. Bookings per supermarket  (chart: bar, x = supermarket, y = bookings)
select o->>'storeName'                        as supermarket,
       count(*)                               as bookings,
       round(sum((o->>'total')::numeric), 2)  as revenue_eur,
       round(avg((o->>'total')::numeric), 2)  as avg_basket_eur
from user_data d,
     jsonb_array_elements(d.data->'orders') o
where o->>'status' <> 'annullato'
group by supermarket
order by bookings desc;


-- 4. How far ahead people book  (chart: bar, x = days_ahead, y = bookings)
--    Shows whether the -5% / -10% / -15% discount steps change behaviour.
select (o->>'advance')::int as days_ahead,
       count(*)             as bookings,
       round(100.0 * count(*) / sum(count(*)) over (), 1) as share_pct
from user_data d,
     jsonb_array_elements(d.data->'orders') o
where o->>'status' <> 'annullato'
group by days_ahead
order by days_ahead;


-- 5. Pickup method: in store, locker or delivery  (chart: bar, x = method, y = bookings)
select case o->>'method'
         when 'instore'  then 'In store'
         when 'locker'   then 'Locker'
         when 'delivery' then 'Delivery'
         else o->>'method'
       end      as method,
       count(*) as bookings
from user_data d,
     jsonb_array_elements(d.data->'orders') o
where o->>'status' <> 'annullato'
group by method
order by bookings desc;


-- 6. Booking status: active, picked up, cancelled  (chart: bar, x = status, y = bookings)
select case o->>'status'
         when 'attivo'     then 'Active'
         when 'completato' then 'Picked up'
         when 'annullato'  then 'Cancelled'
         else o->>'status'
       end      as status,
       count(*) as bookings
from user_data d,
     jsonb_array_elements(d.data->'orders') o
group by status
order by bookings desc;


-- 7. Top 15 most-booked products  (chart: bar, x = product, y = units)
select l->>'name'                                                as product,
       l->>'category'                                            as department,
       sum((l->>'qty')::int)                                     as units,
       round(sum((l->>'qty')::int * (l->>'unitFinal')::numeric), 2) as revenue_eur
from user_data d,
     jsonb_array_elements(d.data->'orders') o,
     jsonb_array_elements(o->'lines') l
where o->>'status' <> 'annullato'
group by product, department
order by units desc
limit 15;


-- 8. Bookings per department  (chart: bar, x = department, y = units)
select l->>'category'                                            as department,
       sum((l->>'qty')::int)                                     as units,
       round(sum((l->>'qty')::int * (l->>'unitFinal')::numeric), 2) as revenue_eur,
       round(sum((l->>'qty')::int * (l->>'weightKg')::numeric), 1)  as kg_food
from user_data d,
     jsonb_array_elements(d.data->'orders') o,
     jsonb_array_elements(o->'lines') l
where o->>'status' <> 'annullato'
group by department
order by units desc;


-- 9. Average feedback score per question, 1-5  (chart: bar, x = question, y = avg_score)
select case r.key
         when 'overall'   then 'Overall experience'
         when 'easy'      then 'Booking was easy'
         when 'complete'  then 'All products found'
         when 'quality'   then 'Quality and freshness'
         when 'staff'     then 'Staff'
         when 'timing'    then 'On time'
         when 'recommend' then 'Would recommend'
         else r.key
       end                                   as question,
       round(avg(r.value::numeric), 2)       as avg_score,
       count(*)                              as answers
from user_data d,
     jsonb_array_elements(d.data->'feedbacks') f,
     jsonb_each_text(f->'ratings') r
group by r.key
order by avg_score desc;


-- 10. Headline numbers for the pitch  (one row; use "Results", not "Chart")
select (select count(*) from auth.users)                                   as users,
       count(*)                                                            as bookings,
       count(*) filter (where o->>'status' = 'completato')                 as picked_up,
       round(sum((o->>'total')::numeric), 2)                               as revenue_eur,
       round(sum((o->>'discount')::numeric), 2)                            as customer_savings_eur,
       round(avg((o->>'total')::numeric), 2)                               as avg_basket_eur,
       round(sum((o->>'kgFood')::numeric), 1)                              as kg_food_booked,
       round(avg((o->>'advance')::numeric), 1)                             as avg_days_ahead
from user_data d,
     jsonb_array_elements(d.data->'orders') o
where o->>'status' <> 'annullato';


-- 11. What users say they care about  (chart: bar, x = interest, y = users)
select i        as interest,
       count(*) as users
from user_data d,
     jsonb_array_elements_text(d.data->'profile'->'interests') i
group by interest
order by users desc;
