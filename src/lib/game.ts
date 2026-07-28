import { supabase } from './supabase';
import { getCurrentUser } from '../auth';

// ── Slug <-> DB id lookups ───────────────────────────────────────────────
// Presentation content (name/tier/tagline/colors) stays in src/data/*.ts,
// keyed by string slug. Only game mechanics need the numeric DB row id.

let housewifeIdBySlug: Map<string, number> | null = null;
let housewifeSlugById: Map<number, string> | null = null;
let franchiseIdBySlug: Map<string, number> | null = null;

async function ensureHousewifeMaps() {
  if (housewifeIdBySlug) return;
  const { data, error } = await supabase!.from('housewives').select('id, slug');
  if (error) throw error;
  housewifeIdBySlug = new Map((data ?? []).map(r => [r.slug, r.id]));
  housewifeSlugById = new Map((data ?? []).map(r => [r.id, r.slug]));
}

async function ensureFranchiseMap() {
  if (franchiseIdBySlug) return;
  const { data, error } = await supabase!.from('franchises').select('id, slug');
  if (error) throw error;
  franchiseIdBySlug = new Map((data ?? []).map(r => [r.slug, r.id]));
}

async function housewifeIdFor(slug: string): Promise<number> {
  await ensureHousewifeMaps();
  const id = housewifeIdBySlug!.get(slug);
  if (id === undefined) throw new Error(`Unknown housewife slug: ${slug}`);
  return id;
}

async function franchiseIdFor(slug: string): Promise<number> {
  await ensureFranchiseMap();
  const id = franchiseIdBySlug!.get(slug);
  if (id === undefined) throw new Error(`Unknown franchise slug: ${slug}`);
  return id;
}

function requireUser() {
  const user = getCurrentUser();
  if (!user) throw new Error('You must be signed in to do that.');
  return user;
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'league';
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

// ── Team / League ────────────────────────────────────────────────────────

export interface MyTeam {
  teamId: string;
  teamName: string;
  leagueId: string;
  leagueName: string;
  leagueSlug: string;
  rosterSize: number;
  maxTeams: number;
}

export async function getMyTeam(): Promise<MyTeam | null> {
  const user = requireUser();
  const { data, error } = await supabase!
    .from('fantasy_teams')
    .select('id, name, leagues!inner(id, name, slug, roster_size, max_teams)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const league = Array.isArray(data.leagues) ? data.leagues[0] : data.leagues;
  return {
    teamId: data.id,
    teamName: data.name,
    leagueId: league.id,
    leagueName: league.name,
    leagueSlug: league.slug,
    rosterSize: league.roster_size,
    maxTeams: league.max_teams,
  };
}

export async function createLeague(leagueName: string, teamName: string, maxTeams: number): Promise<MyTeam> {
  const user = requireUser();
  const slug = `${slugify(leagueName)}-${randomSuffix()}`;

  const { data: league, error: leagueError } = await supabase!
    .from('leagues')
    // is_public gates the leagues SELECT RLS policy — anyone with the invite code
    // needs to be able to look the league up by slug to join it, not just the commissioner.
    .insert({ name: leagueName, slug, commissioner_id: user.id, max_teams: maxTeams, roster_size: 10, is_public: true })
    .select()
    .single();
  if (leagueError) throw leagueError;

  const { data: team, error: teamError } = await supabase!
    .from('fantasy_teams')
    .insert({ league_id: league.id, user_id: user.id, name: teamName })
    .select()
    .single();
  if (teamError) throw teamError;

  return {
    teamId: team.id,
    teamName: team.name,
    leagueId: league.id,
    leagueName: league.name,
    leagueSlug: league.slug,
    rosterSize: league.roster_size,
    maxTeams: league.max_teams,
  };
}

export async function joinLeague(code: string, teamName: string): Promise<MyTeam> {
  const user = requireUser();
  const { data: league, error: leagueError } = await supabase!
    .from('leagues')
    .select('id, name, slug, roster_size, max_teams')
    .eq('slug', code.trim())
    .maybeSingle();
  if (leagueError) throw leagueError;
  if (!league) throw new Error('No league found with that code.');

  const { count, error: countError } = await supabase!
    .from('fantasy_teams')
    .select('id', { count: 'exact', head: true })
    .eq('league_id', league.id);
  if (countError) throw countError;
  if ((count ?? 0) >= league.max_teams) throw new Error('That league is already full.');

  const { data: team, error: teamError } = await supabase!
    .from('fantasy_teams')
    .insert({ league_id: league.id, user_id: user.id, name: teamName })
    .select()
    .single();
  if (teamError) throw teamError;

  return {
    teamId: team.id,
    teamName: team.name,
    leagueId: league.id,
    leagueName: league.name,
    leagueSlug: league.slug,
    rosterSize: league.roster_size,
    maxTeams: league.max_teams,
  };
}

export interface StandingsRow {
  teamId: string;
  name: string;
  points: number;
}

export async function fetchStandings(leagueId: string): Promise<StandingsRow[]> {
  const { data: teams, error: teamsError } = await supabase!
    .from('fantasy_teams')
    .select('id, name')
    .eq('league_id', leagueId);
  if (teamsError) throw teamsError;
  if (!teams || teams.length === 0) return [];

  const teamIds = teams.map(t => t.id);
  const { data: slots, error: slotsError } = await supabase!
    .from('roster_slots')
    .select('team_id, housewife_id')
    .in('team_id', teamIds);
  if (slotsError) throw slotsError;

  const housewifeIds = [...new Set((slots ?? []).map(s => s.housewife_id))];
  const scoreByHousewife = new Map<number, number>();
  if (housewifeIds.length) {
    const { data: scores, error: scoresError } = await supabase!
      .from('fantasy_scores')
      .select('housewife_id, points')
      .in('housewife_id', housewifeIds);
    if (scoresError) throw scoresError;
    for (const row of scores ?? []) {
      scoreByHousewife.set(row.housewife_id, (scoreByHousewife.get(row.housewife_id) ?? 0) + row.points);
    }
  }

  return teams
    .map(team => {
      const myHousewifeIds = (slots ?? []).filter(s => s.team_id === team.id).map(s => s.housewife_id);
      const points = myHousewifeIds.reduce((sum, id) => sum + (scoreByHousewife.get(id) ?? 0), 0);
      return { teamId: team.id, name: team.name, points };
    })
    .sort((a, b) => b.points - a.points);
}

// ── Roster ───────────────────────────────────────────────────────────────

export async function fetchRoster(teamId: string): Promise<string[]> {
  await ensureHousewifeMaps();
  const { data, error } = await supabase!.from('roster_slots').select('housewife_id').eq('team_id', teamId);
  if (error) throw error;
  return (data ?? []).map(r => housewifeSlugById!.get(r.housewife_id)).filter((s): s is string => !!s);
}

export async function draftHousewife(teamId: string, slug: string): Promise<void> {
  const housewifeId = await housewifeIdFor(slug);
  const { error } = await supabase!.from('roster_slots').insert({ team_id: teamId, housewife_id: housewifeId, acquired_via: 'draft' });
  if (error) throw error;
}

export async function dropHousewife(teamId: string, slug: string): Promise<void> {
  const housewifeId = await housewifeIdFor(slug);
  const { error } = await supabase!.from('roster_slots').delete().eq('team_id', teamId).eq('housewife_id', housewifeId);
  if (error) throw error;
}

// ── Opponents / Trades ───────────────────────────────────────────────────

export interface OpponentTeam {
  teamId: string;
  name: string;
  roster: string[];
}

export async function fetchOpponentTeams(leagueId: string, excludeTeamId: string): Promise<OpponentTeam[]> {
  await ensureHousewifeMaps();
  const { data: teams, error: teamsError } = await supabase!
    .from('fantasy_teams')
    .select('id, name')
    .eq('league_id', leagueId)
    .neq('id', excludeTeamId);
  if (teamsError) throw teamsError;
  if (!teams || teams.length === 0) return [];

  const teamIds = teams.map(t => t.id);
  const { data: slots, error: slotsError } = await supabase!
    .from('roster_slots')
    .select('team_id, housewife_id')
    .in('team_id', teamIds);
  if (slotsError) throw slotsError;

  return teams.map(team => ({
    teamId: team.id,
    name: team.name,
    roster: (slots ?? [])
      .filter(s => s.team_id === team.id)
      .map(s => housewifeSlugById!.get(s.housewife_id))
      .filter((s): s is string => !!s),
  }));
}

export interface PendingTrade {
  id: string;
  fromTeamId: string;
  fromTeamName: string;
  offeredSlug: string;
  requestedSlug: string;
  createdAt: string;
}

export async function proposeTrade(
  leagueId: string,
  fromTeamId: string,
  toTeamId: string,
  offeredSlug: string,
  requestedSlug: string
): Promise<void> {
  const [offeredId, requestedId] = await Promise.all([housewifeIdFor(offeredSlug), housewifeIdFor(requestedSlug)]);
  const { error } = await supabase!.from('trade_offers').insert({
    league_id: leagueId,
    from_team_id: fromTeamId,
    to_team_id: toTeamId,
    offered_housewife_id: offeredId,
    requested_housewife_id: requestedId,
  });
  if (error) throw error;
}

export async function fetchPendingTrades(teamId: string): Promise<PendingTrade[]> {
  await ensureHousewifeMaps();
  const { data, error } = await supabase!
    .from('trade_offers')
    .select('id, from_team_id, offered_housewife_id, requested_housewife_id, created_at, fantasy_teams!trade_offers_from_team_id_fkey(name)')
    .eq('to_team_id', teamId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    fromTeamId: row.from_team_id,
    fromTeamName: Array.isArray(row.fantasy_teams) ? row.fantasy_teams[0]?.name : row.fantasy_teams?.name,
    offeredSlug: housewifeSlugById!.get(row.offered_housewife_id) ?? '',
    requestedSlug: housewifeSlugById!.get(row.requested_housewife_id) ?? '',
    createdAt: row.created_at,
  }));
}

export async function respondToTrade(tradeId: string, accept: boolean): Promise<void> {
  const { error } = await supabase!.rpc(accept ? 'accept_trade' : 'reject_trade', { trade_id: tradeId });
  if (error) throw error;
}

export interface TradeHistoryEntry {
  id: string;
  otherTeamName: string;
  offeredSlug: string;
  requestedSlug: string;
  status: string;
  isIncoming: boolean;
}

export async function fetchTeamTradeHistory(teamId: string): Promise<TradeHistoryEntry[]> {
  await ensureHousewifeMaps();
  const { data, error } = await supabase!
    .from('trade_offers')
    .select(`
      id, from_team_id, to_team_id, offered_housewife_id, requested_housewife_id, status,
      from_team:fantasy_teams!trade_offers_from_team_id_fkey(name),
      to_team:fantasy_teams!trade_offers_to_team_id_fkey(name)
    `)
    .or(`from_team_id.eq.${teamId},to_team_id.eq.${teamId}`)
    .order('created_at', { ascending: false })
    .limit(25);
  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const isIncoming = row.to_team_id === teamId;
    const otherTeam = isIncoming ? row.from_team : row.to_team;
    return {
      id: row.id,
      otherTeamName: Array.isArray(otherTeam) ? otherTeam[0]?.name : otherTeam?.name,
      offeredSlug: housewifeSlugById!.get(row.offered_housewife_id) ?? '',
      requestedSlug: housewifeSlugById!.get(row.requested_housewife_id) ?? '',
      status: row.status,
      isIncoming,
    };
  });
}

// ── Voting / Scoring ─────────────────────────────────────────────────────

// Maps the frontend's short vote-category keys to the DB's `votes.category` enum.
const CATEGORY_DB_MAP: Record<string, string> = {
  mvp: 'mvp',
  confessional: 'best_confessional',
  read: 'best_read',
  moment: 'best_moment',
  drama: 'drama_impact',
  confrontation: 'best_confrontation_winner',
};

export interface CurrentEpisode {
  id: number;
  episodeNumber: number;
  seasonId: number;
}

export async function getCurrentEpisode(franchiseSlug: string): Promise<CurrentEpisode | null> {
  const franchiseId = await franchiseIdFor(franchiseSlug);
  const { data: seasons, error: seasonsError } = await supabase!.from('seasons').select('id').eq('franchise_id', franchiseId);
  if (seasonsError) throw seasonsError;
  const seasonIds = (seasons ?? []).map(s => s.id);
  if (!seasonIds.length) return null;

  const { data: episode, error: episodeError } = await supabase!
    .from('episodes')
    .select('id, episode_number, season_id')
    .in('season_id', seasonIds)
    .eq('status', 'aired')
    .order('air_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (episodeError) throw episodeError;
  if (!episode) return null;
  return { id: episode.id, episodeNumber: episode.episode_number, seasonId: episode.season_id };
}

export async function submitVote(opts: {
  category: string;
  points: number;
  housewifeSlug: string;
  franchiseSlug: string;
}): Promise<void> {
  const user = requireUser();
  const dbCategory = CATEGORY_DB_MAP[opts.category];
  if (!dbCategory) throw new Error(`Unknown vote category: ${opts.category}`);

  const episode = await getCurrentEpisode(opts.franchiseSlug);
  if (!episode) throw new Error("This housewife's franchise doesn't have an aired episode yet.");

  const housewifeId = await housewifeIdFor(opts.housewifeSlug);

  const { error: voteError } = await supabase!.from('votes').insert({
    episode_id: episode.id,
    user_id: user.id,
    category: dbCategory,
    housewife_id: housewifeId,
  });
  if (voteError) {
    if (voteError.code === '23505') {
      throw new Error("You've already voted this category for the current episode.");
    }
    throw voteError;
  }

  const { error: scoreError } = await supabase!.from('fantasy_scores').insert({
    housewife_id: housewifeId,
    episode_id: episode.id,
    season_id: episode.seasonId,
    category: opts.category,
    points: opts.points,
    reason: `Community vote: ${opts.category}`,
  });
  if (scoreError) throw scoreError;
}

export interface EpisodeHistoryEntry {
  episodeId: number;
  episodeNumber: number;
  entries: { slug: string; points: number }[];
}

export async function fetchSeasonLeaderboard(teamId: string): Promise<{ slug: string; points: number }[]> {
  await ensureHousewifeMaps();
  const roster = await fetchRoster(teamId);
  if (!roster.length) return [];
  const housewifeIds = roster.map(slug => housewifeIdBySlug!.get(slug)!).filter(id => id !== undefined);
  if (!housewifeIds.length) return [];

  const { data, error } = await supabase!.from('fantasy_scores').select('housewife_id, points').in('housewife_id', housewifeIds);
  if (error) throw error;

  const totals = new Map<number, number>();
  for (const row of data ?? []) totals.set(row.housewife_id, (totals.get(row.housewife_id) ?? 0) + row.points);

  return [...totals.entries()]
    .map(([id, points]) => ({ slug: housewifeSlugById!.get(id) ?? '', points }))
    .filter(r => r.slug)
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);
}

export async function fetchEpisodeHistory(teamId: string): Promise<EpisodeHistoryEntry[]> {
  await ensureHousewifeMaps();
  const roster = await fetchRoster(teamId);
  if (!roster.length) return [];
  const housewifeIds = roster.map(slug => housewifeIdBySlug!.get(slug)!).filter(id => id !== undefined);
  if (!housewifeIds.length) return [];

  const { data: scores, error: scoresError } = await supabase!
    .from('fantasy_scores')
    .select('housewife_id, episode_id, points')
    .in('housewife_id', housewifeIds)
    .not('episode_id', 'is', null);
  if (scoresError) throw scoresError;
  if (!scores || scores.length === 0) return [];

  const episodeIds = [...new Set(scores.map(s => s.episode_id as number))];
  const { data: episodes, error: episodesError } = await supabase!
    .from('episodes')
    .select('id, episode_number, air_date')
    .in('id', episodeIds);
  if (episodesError) throw episodesError;
  const episodeById = new Map((episodes ?? []).map(e => [e.id, e]));

  const byEpisode = new Map<number, { slug: string; points: number }[]>();
  for (const row of scores) {
    const list = byEpisode.get(row.episode_id!) ?? [];
    list.push({ slug: housewifeSlugById!.get(row.housewife_id) ?? '', points: row.points });
    byEpisode.set(row.episode_id!, list);
  }

  return [...byEpisode.entries()]
    .map(([episodeId, entries]) => ({
      episodeId,
      episodeNumber: episodeById.get(episodeId)?.episode_number ?? 0,
      entries: entries.filter(e => e.slug).sort((a, b) => b.points - a.points).slice(0, 3),
    }))
    .sort((a, b) => (episodeById.get(b.episodeId)?.air_date ?? '').localeCompare(episodeById.get(a.episodeId)?.air_date ?? ''));
}
