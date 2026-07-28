-- The original "Users manage own teams" policy is FOR ALL USING (auth.uid() = user_id),
-- which also governs SELECT — so a user could only ever see their own fantasy_teams
-- row, never their leaguemates'. That silently breaks standings (only shows your own
-- team) and the trades opponent list (always empty, even with real teams in the
-- league). Add a SELECT policy so any member of a league can see all teams in it;
-- the existing policy still governs insert/update/delete to your own row only.

CREATE POLICY "League members view all teams in their league" ON fantasy_teams
  FOR SELECT USING (
    league_id IN (SELECT league_id FROM fantasy_teams WHERE user_id = auth.uid())
  );
