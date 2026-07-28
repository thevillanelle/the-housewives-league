import * as d3 from 'd3';
import { HOUSEWIVES, TIER_COLORS, TIER_LABELS } from '../data/housewives';
import { FRANCHISES } from '../data/franchises';
import { renderTrades } from './trades';
import { getCurrentUser, onAuthChange, openAuthModal } from '../auth';
import {
  getMyTeam, createLeague, joinLeague, fetchRoster, draftHousewife, dropHousewife,
  fetchStandings, submitVote, fetchSeasonLeaderboard, fetchEpisodeHistory,
  type MyTeam, type StandingsRow,
} from '../lib/game';

// ── State ────────────────────────────────────────────────────────────────

export let myTeam: MyTeam | null = null;
export let rosterSlugs: string[] = [];
let standings: StandingsRow[] = [];
let loading = false;

export function getMyRosterSlugs(): string[] { return rosterSlugs; }

function getFranchise(id: string) { return FRANCHISES.find(f => f.id === id); }
function getFranchiseColor(id: string) { return getFranchise(id)?.color ?? '#7a5c68'; }
function getFranchiseAbbr(id: string) { return getFranchise(id)?.abbr ?? id.toUpperCase(); }
function getInitials(name: string) { return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase(); }

async function loadState() {
  const user = getCurrentUser();
  if (!user) {
    myTeam = null;
    rosterSlugs = [];
    standings = [];
    refresh();
    return;
  }

  loading = true;
  refresh();
  try {
    myTeam = await getMyTeam();
    if (myTeam) {
      [rosterSlugs, standings] = await Promise.all([
        fetchRoster(myTeam.teamId),
        fetchStandings(myTeam.leagueId),
      ]);
    } else {
      rosterSlugs = [];
      standings = [];
    }
  } finally {
    loading = false;
    refresh();
  }
}

function lockedPanel(action: string): string {
  return `
    <div class="league-setup">
      <div class="ls-prompt">Sign in to ${action}</div>
      <div class="ls-btns">
        <button class="ls-btn" id="lock-sign-in">Sign In</button>
      </div>
    </div>`;
}

function wireLockButtons(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('#lock-sign-in').forEach(btn => {
    btn.addEventListener('click', openAuthModal);
  });
}

// ── Roster ─────────────────────────────────────────────────────────────────

function updateRosterHeader() {
  const el = document.getElementById('roster-count');
  if (el) el.textContent = myTeam ? `${rosterSlugs.length} / ${myTeam.rosterSize} Players Drafted` : '0 / 10 Players Drafted';
}

function updateRosterValue() {
  const el = document.getElementById('roster-value');
  if (!el) return;
  const total = HOUSEWIVES.filter(h => rosterSlugs.includes(h.id)).reduce((s, h) => s + h.fantasyValue, 0);
  el.textContent = total.toLocaleString();
}

function renderRosterGrid() {
  const grid = document.getElementById('roster-grid');
  if (!grid) return;

  if (!getCurrentUser()) { grid.innerHTML = lockedPanel('draft players'); wireLockButtons(grid); return; }
  if (!myTeam) { grid.innerHTML = '<div class="elog-empty-sub">Set up your league to start drafting.</div>'; return; }

  const drafted = HOUSEWIVES.filter(h => rosterSlugs.includes(h.id));
  const empty = myTeam.rosterSize - drafted.length;

  const draftedHTML = drafted.map(h => {
    const fc = getFranchiseColor(h.primaryFranchise);
    const abbr = getFranchiseAbbr(h.primaryFranchise);
    const tc = TIER_COLORS[h.tier];
    return `
      <div class="roster-slot filled" style="--fc:${fc}">
        <div class="rs-stripe"></div>
        <div class="rs-content">
          <div class="rs-avatar" style="border-color:${fc}">${getInitials(h.name)}</div>
          <div class="rs-info">
            <div class="rs-name">${h.name}</div>
            <div class="rs-meta"><span style="color:${fc}">${abbr}</span><span style="color:${tc};margin-left:6px">${TIER_LABELS[h.tier]}</span></div>
          </div>
          <div class="rs-value">${h.fantasyValue.toLocaleString()}</div>
          <button class="rs-remove" data-id="${h.id}">✕</button>
        </div>
      </div>`;
  }).join('');

  const emptyHTML = Array.from({ length: Math.max(empty, 0) }, (_, i) => `
    <div class="roster-slot empty">
      <div class="rs-icon">◇</div>
      <div class="rs-label">Open Slot ${drafted.length + i + 1}</div>
    </div>`).join('');

  grid.innerHTML = draftedHTML + emptyHTML;
  grid.querySelectorAll<HTMLElement>('.rs-remove').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!myTeam) return;
      await dropHousewife(myTeam.teamId, btn.dataset.id!);
      rosterSlugs = rosterSlugs.filter(s => s !== btn.dataset.id);
      refresh();
    });
  });
}

function refresh() {
  renderRosterGrid();
  renderDraftPool();
  updateRosterHeader();
  updateRosterValue();
  renderVoting();
  renderLeaguePanel();
}

// ── Draft Pool ─────────────────────────────────────────────────────────────

function renderDraftPool() {
  const pool = document.getElementById('draft-pool');
  if (!pool) return;

  if (!getCurrentUser()) { pool.innerHTML = lockedPanel('draft players'); wireLockButtons(pool); return; }
  if (!myTeam) { pool.innerHTML = '<div class="elog-empty-sub">Set up your league to see the draft pool.</div>'; return; }

  const available = HOUSEWIVES.filter(h => !rosterSlugs.includes(h.id))
    .sort((a, b) => b.fantasyValue - a.fantasyValue);

  pool.innerHTML = available.map(h => {
    const fc = getFranchiseColor(h.primaryFranchise);
    const abbr = getFranchiseAbbr(h.primaryFranchise);
    const tc = TIER_COLORS[h.tier];
    const canDraft = rosterSlugs.length < myTeam!.rosterSize;
    return `
      <div class="dp-row" data-id="${h.id}">
        <div class="dp-avatar" style="border-color:${fc}">${getInitials(h.name)}</div>
        <div class="dp-info">
          <div class="dp-name">${h.name}</div>
          <div class="dp-meta"><span style="color:${fc}">${abbr}</span><span style="color:${tc};margin-left:6px">${TIER_LABELS[h.tier]}</span></div>
        </div>
        <div class="dp-value">${h.fantasyValue.toLocaleString()}</div>
        <button class="dp-draft-btn ${canDraft ? '' : 'disabled'}" data-id="${h.id}" ${canDraft ? '' : 'disabled'}>
          ${canDraft ? 'Draft' : 'Full'}
        </button>
      </div>`;
  }).join('');

  pool.querySelectorAll<HTMLElement>('.dp-draft-btn:not(.disabled)').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!myTeam || rosterSlugs.length >= myTeam.rosterSize) return;
      const slug = btn.dataset.id!;
      await draftHousewife(myTeam.teamId, slug);
      rosterSlugs = [...rosterSlugs, slug];
      refresh();
    });
  });
}

// ── Episode Voting ─────────────────────────────────────────────────────────

const VOTE_CATS = [
  { key: 'mvp', label: 'Episode MVP', pts: 10, desc: 'Who ran this episode?' },
  { key: 'confessional', label: 'Best Confessional', pts: 5, desc: 'Most iconic talking-head moment' },
  { key: 'read', label: 'Best Read', pts: 5, desc: 'Who delivered the best read?' },
  { key: 'moment', label: 'Best Moment', pts: 5, desc: 'The scene everyone will remember' },
  { key: 'drama', label: 'Drama Impact', pts: 5, desc: 'Biggest story driver this episode' },
  { key: 'confrontation', label: 'Confrontation Win', pts: 5, desc: 'Who won the confrontation?' },
];

const votes: Record<string, string> = {};
let submitting = false;

function buildPlayerOptions(): string {
  if (rosterSlugs.length === 0) {
    return '<option value="">Draft players first to vote</option>';
  }
  const drafted = HOUSEWIVES.filter(h => rosterSlugs.includes(h.id));
  return '<option value="">— Select a player —</option>' +
    drafted.map(h => `<option value="${h.id}">${h.name} (${getFranchiseAbbr(h.primaryFranchise)})</option>`).join('');
}

function renderVoting() {
  const panel = document.getElementById('vote-panel');
  if (!panel) return;

  if (!getCurrentUser()) { panel.innerHTML = lockedPanel('vote'); wireLockButtons(panel); return; }
  if (!myTeam) { panel.innerHTML = '<div class="elog-empty-sub">Set up your league to start voting.</div>'; return; }

  const hasRoster = rosterSlugs.length > 0;
  panel.innerHTML = `
    <div class="vote-header">
      <div class="vote-eyebrow">Community Voting</div>
      <div class="vote-title">Episode Voting</div>
      <div class="vote-sub">${hasRoster
        ? 'Cast your votes. Points apply to your drafted players’ most recently aired episode.'
        : 'Draft players to your roster first, then vote after each episode.'
      }</div>
    </div>
    <div class="vote-cats">
      ${VOTE_CATS.map(c => `
        <div class="vote-cat">
          <div class="vc-top">
            <span class="vc-label">${c.label}</span>
            <span class="vc-pts">+${c.pts} pts</span>
          </div>
          <div class="vc-desc">${c.desc}</div>
          ${hasRoster
            ? `<select class="vote-select" data-cat="${c.key}">
                ${buildPlayerOptions()}
               </select>`
            : `<div class="vc-locked"><span class="vc-lock-icon">◈</span> Draft a roster to vote</div>`
          }
        </div>`).join('')}
    </div>
    ${hasRoster ? `
      <div style="padding:16px 18px;border-top:1px solid var(--border)">
        <button class="vote-submit-btn" id="vote-submit" ${submitting ? 'disabled' : ''}>${submitting ? 'Submitting…' : 'Submit Votes'}</button>
        <div id="vote-error" style="display:none;color:#c0546e;font-size:11px;margin-top:8px"></div>
      </div>` : ''}`;

  panel.querySelectorAll<HTMLSelectElement>('.vote-select').forEach(sel => {
    sel.value = votes[sel.dataset.cat!] ?? '';
    sel.addEventListener('change', () => {
      votes[sel.dataset.cat!] = sel.value;
    });
  });

  document.getElementById('vote-submit')?.addEventListener('click', async () => {
    const errorEl = document.getElementById('vote-error');
    const picked = VOTE_CATS.filter(c => votes[c.key]);
    if (picked.length === 0) return;

    submitting = true;
    renderVoting();
    try {
      for (const cat of picked) {
        const slug = votes[cat.key];
        const h = HOUSEWIVES.find(hw => hw.id === slug);
        if (!h) continue;
        await submitVote({ category: cat.key, points: cat.pts, housewifeSlug: slug, franchiseSlug: h.primaryFranchise });
      }
      Object.keys(votes).forEach(k => delete votes[k]);
      if (myTeam) {
        renderEpisodeLog();
      }
    } catch (err) {
      if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.textContent = err instanceof Error ? err.message : 'Something went wrong submitting your votes.';
      }
    } finally {
      submitting = false;
      renderVoting();
    }
  });
}

// ── League Creation ─────────────────────────────────────────────────────────

let leagueMode: 'create' | 'join' | null = null;
let leagueBusy = false;
let leagueError = '';

function renderLeaguePanel() {
  const panel = document.getElementById('league-panel');
  if (!panel) return;

  if (!getCurrentUser()) { panel.innerHTML = lockedPanel('create or join a league'); wireLockButtons(panel); return; }

  if (loading) {
    panel.innerHTML = '<div class="elog-empty-sub">Loading your league…</div>';
    return;
  }

  if (myTeam) {
    const standingsHTML = standings.length
      ? standings.map((row, i) => `
          <div class="league-item">
            <div class="li-rank">${i + 1}</div>
            <div class="li-name" ${row.teamId === myTeam!.teamId ? "style='font-style:italic'" : ''}>${row.name}</div>
            <div class="li-pts">${row.points} pts</div>
          </div>`).join('')
      : '<div class="league-item" style="opacity:.5"><div class="li-name">Waiting for scores…</div></div>';

    panel.innerHTML = `
      <div class="league-active">
        <div class="la-eyebrow">Your League</div>
        <div class="la-name">${myTeam.leagueName}</div>
        <div style="font-size:10px;color:var(--muted);margin-top:4px">Invite code: <strong>${myTeam.leagueSlug}</strong> (max ${myTeam.maxTeams} teams)</div>
        <div class="la-standings-label">Standings</div>
        ${standingsHTML}
      </div>`;
    return;
  }

  panel.innerHTML = `
    <div class="league-setup">
      <div class="ls-prompt">Ready to compete?</div>
      <div class="ls-btns">
        <button class="ls-btn" id="ls-create">Create League</button>
        <button class="ls-btn ls-btn-sec" id="ls-join">Join League</button>
        <button class="ls-btn ls-btn-sec" id="ls-solo">Solo Mode</button>
      </div>
      <div id="ls-form" style="display:${leagueMode ? 'block' : 'none'};margin-top:16px">
        <input class="ls-input" id="ls-name-input" type="text" placeholder="${leagueMode === 'join' ? 'League invite code…' : 'League name…'}" maxlength="40">
        <input class="ls-input" id="ls-team-input" type="text" placeholder="Your team name…" maxlength="40" style="margin-top:8px">
        ${leagueMode === 'create' ? `
          <div class="ls-size-row">
            <span style="font-size:10px;color:var(--muted)">Size:</span>
            <button class="ls-size-btn active" data-size="4">4</button>
            <button class="ls-size-btn" data-size="6">6</button>
            <button class="ls-size-btn" data-size="8">8</button>
            <button class="ls-size-btn" data-size="10">10</button>
          </div>` : ''}
        <button class="ls-submit-btn" id="ls-submit" ${leagueBusy ? 'disabled' : ''}>${leagueBusy ? 'Please wait…' : (leagueMode === 'join' ? 'Join League' : 'Launch League')}</button>
        ${leagueError ? `<div style="color:#c0546e;font-size:11px;margin-top:8px">${leagueError}</div>` : ''}
      </div>
    </div>`;

  document.getElementById('ls-create')?.addEventListener('click', () => { leagueMode = 'create'; leagueError = ''; renderLeaguePanel(); });
  document.getElementById('ls-join')?.addEventListener('click', () => { leagueMode = 'join'; leagueError = ''; renderLeaguePanel(); });
  document.getElementById('ls-solo')?.addEventListener('click', async () => {
    leagueBusy = true;
    renderLeaguePanel();
    try {
      myTeam = await createLeague('Solo Fantasy Mode', 'You', 1);
      await loadState();
    } catch (err) {
      leagueError = err instanceof Error ? err.message : 'Could not start solo mode.';
    } finally {
      leagueBusy = false;
      renderLeaguePanel();
    }
  });

  let selectedSize = 4;
  panel.querySelectorAll<HTMLElement>('.ls-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      panel.querySelectorAll('.ls-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = Number(btn.dataset.size);
    });
  });

  document.getElementById('ls-submit')?.addEventListener('click', async () => {
    const nameInput = document.getElementById('ls-name-input') as HTMLInputElement;
    const teamInput = document.getElementById('ls-team-input') as HTMLInputElement;
    const name = nameInput.value.trim();
    const teamName = teamInput.value.trim() || 'My Team';
    if (!name) {
      leagueError = leagueMode === 'join' ? 'Enter an invite code.' : 'Enter a league name.';
      renderLeaguePanel();
      return;
    }

    leagueBusy = true;
    leagueError = '';
    renderLeaguePanel();
    try {
      if (leagueMode === 'join') {
        await joinLeague(name, teamName);
      } else {
        await createLeague(name, teamName, selectedSize);
      }
      leagueMode = null;
      await loadState();
    } catch (err) {
      leagueError = err instanceof Error ? err.message : 'Something went wrong.';
    } finally {
      leagueBusy = false;
      renderLeaguePanel();
    }
  });
}

// ── Episode Log ────────────────────────────────────────────────────────────

export async function renderEpisodeLog() {
  const panel = document.getElementById('episode-log-panel');
  if (!panel) return;

  if (!getCurrentUser()) { panel.innerHTML = lockedPanel('see your episode log'); wireLockButtons(panel); return; }
  if (!myTeam) {
    panel.innerHTML = `
      <div class="elog-empty">
        <div class="elog-empty-icon">◇</div>
        <div class="elog-empty-msg">No league yet</div>
        <div class="elog-empty-sub">Set up a league and draft a roster to begin tracking fantasy points</div>
      </div>`;
    return;
  }

  panel.innerHTML = '<div class="elog-empty-sub">Loading…</div>';
  const [leaderboardRows, history] = await Promise.all([
    fetchSeasonLeaderboard(myTeam.teamId),
    fetchEpisodeHistory(myTeam.teamId),
  ]);

  if (leaderboardRows.length === 0 && history.length === 0) {
    panel.innerHTML = `
      <div class="elog-empty">
        <div class="elog-empty-icon">◇</div>
        <div class="elog-empty-msg">No episodes logged yet</div>
        <div class="elog-empty-sub">Submit your episode votes in the Command Center to begin tracking fantasy points</div>
      </div>`;
    return;
  }

  const leaderboard = leaderboardRows.map((row, i) => {
    const h = HOUSEWIVES.find(hw => hw.id === row.slug);
    if (!h) return '';
    const tc = TIER_COLORS[h.tier];
    const fc = getFranchiseColor(h.primaryFranchise);
    return `
      <div class="elog-ldr-row">
        <div class="elr-rank">${i + 1}</div>
        <div class="elr-avatar" style="border-color:${fc}">${getInitials(h.name)}</div>
        <div class="elr-name">${h.name}</div>
        <div class="elr-pts" style="color:${tc}">+${row.points} pts</div>
      </div>`;
  }).join('');

  const sessionHistory = history.map(session => `
      <div class="elog-session">
        <div class="els-header">
          <span class="els-ep">Episode ${session.episodeNumber}</span>
        </div>
        ${session.entries.map(entry => {
          const h = HOUSEWIVES.find(hw => hw.id === entry.slug);
          if (!h) return '';
          const tc = TIER_COLORS[h.tier];
          return `<div class="els-row"><span class="els-name">${h.name}</span><span style="color:${tc}">+${entry.points} pts</span></div>`;
        }).join('')}
      </div>`).join('');

  panel.innerHTML = `
    <div class="elog-layout">
      <div class="elog-col">
        <div class="elog-col-header">
          <span class="elog-col-label">Season Leaderboard</span>
        </div>
        <div class="elog-leaderboard">${leaderboard || '<div style="padding:16px;color:var(--muted);font-size:11px">No roster players scored yet</div>'}</div>
      </div>
      <div class="elog-col">
        <div class="elog-col-header">
          <span class="elog-col-label">Episode History</span>
        </div>
        <div class="elog-sessions">${sessionHistory}</div>
      </div>
    </div>`;
}

// ── Tab Manager ─────────────────────────────────────────────────────────────

function initTabs() {
  document.querySelectorAll<HTMLElement>('.ft-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ft-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab!;

      const panelIds = ['fp-command', 'fp-trades', 'fp-log'];
      panelIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });

      const active = document.getElementById(`fp-${tab}`);
      if (active) active.style.display = '';

      if (tab === 'trades') renderTrades();
      if (tab === 'log') renderEpisodeLog();
      if (tab === 'command') refresh();
    });
  });

  document.addEventListener('thl:trade-complete', () => {
    loadState();
  });
}

// ── Fantasy Analytics (D3) ─────────────────────────────────────────────────

function renderAnalyticsChart() {
  const el = document.getElementById('fantasy-analytics-chart');
  if (!el || el.dataset.init) return;
  el.dataset.init = '1';

  const rosterList = HOUSEWIVES.filter(h => rosterSlugs.includes(h.id))
    .sort((a, b) => b.fantasyValue - a.fantasyValue);

  if (rosterList.length === 0) {
    el.innerHTML = '<div style="padding:24px;text-align:center;font-family:Space Mono,monospace;font-size:9px;letter-spacing:2px;color:var(--muted);text-transform:uppercase">Draft players to see analytics</div>';
    return;
  }

  const margin = { top: 8, right: 60, bottom: 8, left: 120 };
  const width = (el.clientWidth || 400) - margin.left - margin.right;
  const barH = 22;
  const height = rosterList.length * (barH + 4);

  d3.select(el).select('svg').remove();

  const svg = d3.select(el).append('svg')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(rosterList, d => d.fantasyValue) ?? 1000])
    .range([0, width]);

  const y = d3.scaleBand<number>()
    .domain(rosterList.map((_, i) => i))
    .range([0, height])
    .padding(0.2);

  g.selectAll('rect').data(rosterList).join('rect')
    .attr('x', 0).attr('y', (_, i) => y(i) ?? 0)
    .attr('width', d => x(d.fantasyValue))
    .attr('height', y.bandwidth())
    .attr('fill', d => TIER_COLORS[d.tier])
    .attr('fill-opacity', 0.22)
    .attr('rx', 2);

  g.selectAll('.bar-border').data(rosterList).join('line')
    .attr('x1', 0).attr('x2', d => x(d.fantasyValue))
    .attr('y1', (_, i) => (y(i) ?? 0) + y.bandwidth())
    .attr('y2', (_, i) => (y(i) ?? 0) + y.bandwidth())
    .attr('stroke', d => TIER_COLORS[d.tier]).attr('stroke-width', 1).attr('stroke-opacity', 0.5);

  g.selectAll('.name').data(rosterList).join('text')
    .attr('x', -6).attr('y', (_, i) => (y(i) ?? 0) + y.bandwidth() / 2 + 1)
    .attr('text-anchor', 'end').attr('dominant-baseline', 'middle')
    .attr('fill', '#f0e8d8').attr('font-size', '10px').attr('font-family', 'Inter,sans-serif')
    .text(d => d.name.split(' ')[0] + ' ' + d.name.split(' ').slice(-1)[0]);

  g.selectAll('.val').data(rosterList).join('text')
    .attr('x', d => x(d.fantasyValue) + 6).attr('y', (_, i) => (y(i) ?? 0) + y.bandwidth() / 2 + 1)
    .attr('dominant-baseline', 'middle')
    .attr('fill', d => TIER_COLORS[d.tier]).attr('font-size', '9px')
    .attr('font-family', 'Space Mono,monospace').attr('font-weight', '700')
    .text(d => d.fantasyValue.toLocaleString());
}

// ── Init ───────────────────────────────────────────────────────────────────

export function initFantasy() {
  initTabs();
  refresh();
  onAuthChange(() => { loadState(); });
  loadState();

  document.addEventListener('thl:navigate', (e: Event) => {
    if ((e as CustomEvent).detail === 'fantasy') {
      renderAnalyticsChart();
    }
  });
}
