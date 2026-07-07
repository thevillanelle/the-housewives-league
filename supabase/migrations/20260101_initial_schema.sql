-- THL Initial Schema
-- The Housewives League — Full Universe Data Model

-- ── GEOGRAPHICAL HIERARCHY ───────────────────────────────────────────────

CREATE TABLE regions (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL  -- 'north-america', 'europe', etc.
);

CREATE TABLE countries (
  id        SERIAL PRIMARY KEY,
  region_id INTEGER NOT NULL REFERENCES regions(id),
  name      TEXT NOT NULL,
  code      TEXT UNIQUE NOT NULL  -- ISO 2-letter: 'US', 'AU', etc.
);

CREATE TABLE cities (
  id         SERIAL PRIMARY KEY,
  country_id INTEGER NOT NULL REFERENCES countries(id),
  name       TEXT NOT NULL,
  lat        DECIMAL(10,6) NOT NULL,
  lng        DECIMAL(10,6) NOT NULL
);

-- ── FRANCHISES ───────────────────────────────────────────────────────────

CREATE TABLE franchises (
  id             SERIAL PRIMARY KEY,
  city_id        INTEGER REFERENCES cities(id),
  name           TEXT NOT NULL,
  short_name     TEXT NOT NULL,
  abbreviation   TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  network        TEXT NOT NULL DEFAULT 'Bravo',
  debut_year     INTEGER,
  status         TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','cancelled','hiatus')),
  seasons_count  INTEGER NOT NULL DEFAULT 0,
  description    TEXT,
  color          TEXT,   -- hex for UI
  logo_url       TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── SEASONS ──────────────────────────────────────────────────────────────

CREATE TABLE seasons (
  id             SERIAL PRIMARY KEY,
  franchise_id   INTEGER NOT NULL REFERENCES franchises(id),
  season_number  INTEGER NOT NULL,
  year_start     INTEGER,
  year_end       INTEGER,
  premiere_date  DATE,
  finale_date    DATE,
  episode_count  INTEGER,
  status         TEXT NOT NULL DEFAULT 'completed'
                   CHECK (status IN ('upcoming','airing','completed')),
  UNIQUE (franchise_id, season_number)
);

-- ── EPISODES ─────────────────────────────────────────────────────────────

CREATE TABLE episodes (
  id             SERIAL PRIMARY KEY,
  season_id      INTEGER NOT NULL REFERENCES seasons(id),
  episode_number INTEGER NOT NULL,
  title          TEXT,
  air_date       DATE,
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'aired'
                   CHECK (status IN ('upcoming','aired')),
  UNIQUE (season_id, episode_number)
);

-- ── HOUSEWIVES (FANTASY PLAYERS) ─────────────────────────────────────────

CREATE TABLE housewives (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  bio            TEXT,
  hometown       TEXT,
  photo_url      TEXT,
  instagram      TEXT,
  debut_year     INTEGER,
  fantasy_value  INTEGER NOT NULL DEFAULT 100,
  career_points  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Which housewife appeared on which franchise in which season

CREATE TABLE franchise_memberships (
  id               SERIAL PRIMARY KEY,
  housewife_id     INTEGER NOT NULL REFERENCES housewives(id),
  franchise_id     INTEGER NOT NULL REFERENCES franchises(id),
  season_id        INTEGER REFERENCES seasons(id),
  role             TEXT NOT NULL DEFAULT 'housewife'
                     CHECK (role IN ('housewife','friend_of','guest','legend')),
  joined_mid_season BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (housewife_id, season_id)
);

-- ── FANTASY LEAGUES ──────────────────────────────────────────────────────

CREATE TABLE leagues (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  commissioner_id UUID REFERENCES auth.users(id),
  max_teams      INTEGER NOT NULL DEFAULT 10,
  roster_size    INTEGER NOT NULL DEFAULT 10,
  draft_status   TEXT NOT NULL DEFAULT 'pending'
                   CHECK (draft_status IN ('pending','drafting','active','complete')),
  is_public      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fantasy_teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id   UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  name        TEXT NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (league_id, user_id)
);

CREATE TABLE roster_slots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       UUID NOT NULL REFERENCES fantasy_teams(id) ON DELETE CASCADE,
  housewife_id  INTEGER NOT NULL REFERENCES housewives(id),
  acquired_via  TEXT NOT NULL DEFAULT 'draft'
                  CHECK (acquired_via IN ('draft','trade','waiver','free_agent')),
  acquired_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, housewife_id)
);

-- ── COMMUNITY VOTING ─────────────────────────────────────────────────────

CREATE TABLE votes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id    INTEGER NOT NULL REFERENCES episodes(id),
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  category      TEXT NOT NULL
                  CHECK (category IN (
                    'mvp','best_confessional','best_moment',
                    'best_read','best_confrontation_winner',
                    'best_confrontation_loser','drama_impact'
                  )),
  housewife_id  INTEGER NOT NULL REFERENCES housewives(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (episode_id, user_id, category)
);

-- ── FANTASY SCORING ──────────────────────────────────────────────────────

CREATE TABLE fantasy_scores (
  id            SERIAL PRIMARY KEY,
  housewife_id  INTEGER NOT NULL REFERENCES housewives(id),
  episode_id    INTEGER REFERENCES episodes(id),
  season_id     INTEGER REFERENCES seasons(id),
  category      TEXT NOT NULL,
  points        INTEGER NOT NULL,
  reason        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scoring points reference (per Rule Book v1.0):
-- episode_mvp_1st          = 10 pts
-- episode_mvp_2nd          = 5 pts
-- episode_mvp_3rd          = 3 pts
-- best_confessional        = 5 pts
-- best_moment              = 5 pts
-- best_read                = 5 pts
-- best_confrontation_win   = 5 pts
-- best_confrontation_loss  = 1 pt
-- drama_impact             = 5 pts
-- fan_momentum_bonus       = 3 pts
-- season_mvp               = 25 pts
-- best_season_performance  = 15 pts
-- breakout_performance     = 10 pts
-- reunion_performance      = 10 pts

-- ── BRAVO CALENDAR ───────────────────────────────────────────────────────

CREATE TABLE bravo_calendar (
  id            SERIAL PRIMARY KEY,
  franchise_id  INTEGER REFERENCES franchises(id),
  event_type    TEXT NOT NULL
                  CHECK (event_type IN (
                    'premiere','episode','reunion',
                    'announcement','cast_addition','special'
                  )),
  title         TEXT NOT NULL,
  event_date    DATE NOT NULL,
  description   TEXT,
  is_confirmed  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Public read on all universe data
CREATE POLICY "Public read franchises" ON franchises FOR SELECT USING (true);
CREATE POLICY "Public read housewives" ON housewives FOR SELECT USING (true);
CREATE POLICY "Public read seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Public read episodes" ON episodes FOR SELECT USING (true);
CREATE POLICY "Public read memberships" ON franchise_memberships FOR SELECT USING (true);
CREATE POLICY "Public read calendar" ON bravo_calendar FOR SELECT USING (true);
CREATE POLICY "Public read scores" ON fantasy_scores FOR SELECT USING (true);

-- Public leagues are readable by all
CREATE POLICY "Public leagues are readable" ON leagues
  FOR SELECT USING (is_public = true OR auth.uid() = commissioner_id);

-- Users manage their own teams
CREATE POLICY "Users manage own teams" ON fantasy_teams
  FOR ALL USING (auth.uid() = user_id);

-- Users manage their own roster
CREATE POLICY "Users manage own roster" ON roster_slots
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM fantasy_teams WHERE id = team_id)
  );

-- One vote per user per episode per category
CREATE POLICY "Users manage own votes" ON votes
  FOR ALL USING (auth.uid() = user_id);

-- ── INDEXES ──────────────────────────────────────────────────────────────

CREATE INDEX ON franchise_memberships (franchise_id);
CREATE INDEX ON franchise_memberships (housewife_id);
CREATE INDEX ON fantasy_scores (housewife_id);
CREATE INDEX ON fantasy_scores (episode_id);
CREATE INDEX ON votes (episode_id, category);
CREATE INDEX ON roster_slots (team_id);
CREATE INDEX ON bravo_calendar (event_date);
CREATE INDEX ON bravo_calendar (franchise_id);
