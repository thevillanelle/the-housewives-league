-- Same pattern as fantasy_teams: "Users manage own roster" is FOR ALL USING
-- (your own team only), which also governs SELECT. Standings need to sum
-- every team's roster in a league, and the trades UI needs to show an
-- opponent's roster — both were silently blocked for anyone else's rows.

CREATE POLICY "League members view rosters in their league" ON roster_slots
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM fantasy_teams
      WHERE league_id IN (SELECT league_id FROM fantasy_teams WHERE user_id = auth.uid())
    )
  );
