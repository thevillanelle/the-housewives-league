-- The original schema only ever gave `leagues` a SELECT policy
-- ("Public leagues are readable"). With RLS enabled and no INSERT policy,
-- Postgres default-denies all inserts, so no one has ever been able to
-- create a league. Found via live testing: creating a league returned a
-- 403 "new row violates row-level security policy for table leagues".

CREATE POLICY "Users create their own leagues" ON leagues
  FOR INSERT WITH CHECK (auth.uid() = commissioner_id);
