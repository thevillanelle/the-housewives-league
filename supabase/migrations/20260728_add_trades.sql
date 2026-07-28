-- THL Trades
-- Real trade offers between real fantasy teams, plus RPCs to resolve them.

CREATE TABLE trade_offers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id             UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  from_team_id          UUID NOT NULL REFERENCES fantasy_teams(id) ON DELETE CASCADE,
  to_team_id            UUID NOT NULL REFERENCES fantasy_teams(id) ON DELETE CASCADE,
  offered_housewife_id  INTEGER NOT NULL REFERENCES housewives(id),
  requested_housewife_id INTEGER NOT NULL REFERENCES housewives(id),
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','accepted','rejected')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at           TIMESTAMPTZ,
  CHECK (from_team_id <> to_team_id)
);

ALTER TABLE trade_offers ENABLE ROW LEVEL SECURITY;

-- A team owner can see offers where their team is either side.
CREATE POLICY "Team owners view their trades" ON trade_offers
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM fantasy_teams WHERE id = from_team_id)
    OR auth.uid() = (SELECT user_id FROM fantasy_teams WHERE id = to_team_id)
  );

-- Only the proposing team's owner can create an offer from their own team.
CREATE POLICY "Team owners propose trades" ON trade_offers
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM fantasy_teams WHERE id = from_team_id)
  );

CREATE INDEX ON trade_offers (from_team_id);
CREATE INDEX ON trade_offers (to_team_id);
CREATE INDEX ON trade_offers (league_id, status);

-- ── ACCEPT / REJECT ──────────────────────────────────────────────────────
-- roster_slots RLS only lets a user touch their own team's rows, but accepting
-- a trade must swap rows on BOTH sides atomically. These SECURITY DEFINER
-- functions check authorization themselves, then perform the swap with
-- elevated privileges so the bilateral update can happen in one transaction.

CREATE OR REPLACE FUNCTION accept_trade(trade_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  offer trade_offers%ROWTYPE;
  to_team_owner UUID;
BEGIN
  SELECT * INTO offer FROM trade_offers WHERE id = trade_id FOR UPDATE;

  IF offer IS NULL THEN
    RAISE EXCEPTION 'Trade offer not found';
  END IF;

  IF offer.status <> 'pending' THEN
    RAISE EXCEPTION 'Trade offer is no longer pending';
  END IF;

  SELECT user_id INTO to_team_owner FROM fantasy_teams WHERE id = offer.to_team_id;

  IF auth.uid() IS NULL OR auth.uid() <> to_team_owner THEN
    RAISE EXCEPTION 'Only the receiving team owner can accept this trade';
  END IF;

  -- from_team gives up offered_housewife, receives requested_housewife
  DELETE FROM roster_slots WHERE team_id = offer.from_team_id AND housewife_id = offer.offered_housewife_id;
  INSERT INTO roster_slots (team_id, housewife_id, acquired_via) VALUES (offer.from_team_id, offer.requested_housewife_id, 'trade');

  -- to_team gives up requested_housewife, receives offered_housewife
  DELETE FROM roster_slots WHERE team_id = offer.to_team_id AND housewife_id = offer.requested_housewife_id;
  INSERT INTO roster_slots (team_id, housewife_id, acquired_via) VALUES (offer.to_team_id, offer.offered_housewife_id, 'trade');

  UPDATE trade_offers SET status = 'accepted', resolved_at = now() WHERE id = trade_id;
END;
$$;

CREATE OR REPLACE FUNCTION reject_trade(trade_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  offer trade_offers%ROWTYPE;
  to_team_owner UUID;
BEGIN
  SELECT * INTO offer FROM trade_offers WHERE id = trade_id FOR UPDATE;

  IF offer IS NULL THEN
    RAISE EXCEPTION 'Trade offer not found';
  END IF;

  IF offer.status <> 'pending' THEN
    RAISE EXCEPTION 'Trade offer is no longer pending';
  END IF;

  SELECT user_id INTO to_team_owner FROM fantasy_teams WHERE id = offer.to_team_id;

  IF auth.uid() IS NULL OR auth.uid() <> to_team_owner THEN
    RAISE EXCEPTION 'Only the receiving team owner can reject this trade';
  END IF;

  UPDATE trade_offers SET status = 'rejected', resolved_at = now() WHERE id = trade_id;
END;
$$;
