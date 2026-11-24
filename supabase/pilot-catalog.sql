-- FOODPULSE · PILOT: which catalogue each partner shop sells.
-- Run once in Supabase (SQL Editor -> New query -> paste -> Run), after partner-stores.sql.
-- Then run the PRIVATE file that links each shop (by its store code) to its catalogue.
-- The catalogues themselves (products and prices per kg) are in src/data/pilot.ts.

alter table public.partner_stores add column if not exists catalog text;
