-- Same pattern as the roster_slots fix: "Users manage own teams" is FOR ALL
-- USING (auth.uid() = user_id), which also governs SELECT — so a user could
-- only ever see their own fantasy_teams row, never their leaguemates'. That
-- silently breaks standings (only shows your own team) and the trades
-- opponent list (always empty, even with real teams in the league).
--
-- A naive policy re-querying fantasy_teams from within its own USING clause
-- trips Postgres's RLS recursion detector ("infinite recursion detected in
-- policy for relation fantasy_teams") — found live when this was first
-- attempted directly. Routing the lookup through a SECURITY DEFINER
-- function breaks the cycle, since the function body runs as the (RLS-
-- bypassing) function owner rather than re-entering the calling policy.

CREATE OR REPLACE FUNCTION my_league_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT league_id FROM fantasy_teams WHERE user_id = auth.uid();
$$;

CREATE POLICY "League members view all teams in their league" ON fantasy_teams
  FOR SELECT USING (league_id IN (SELECT my_league_ids()));
