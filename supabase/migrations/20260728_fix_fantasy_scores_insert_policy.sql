-- Same gap as leagues: fantasy_scores only ever had a SELECT policy
-- ("Public read scores"). It has no user_id column (it's a shared scoring
-- ledger, not per-user data), so any signed-in user submitting a community
-- vote needs to be able to insert the resulting score row. Found via live
-- testing: submitting a vote returned a 403 "new row violates row-level
-- security policy for table fantasy_scores".

CREATE POLICY "Authenticated users can log vote-driven scores" ON fantasy_scores
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
