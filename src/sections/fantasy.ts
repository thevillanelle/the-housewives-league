import * as d3 from 'd3';
import { HOUSEWIVES, TIER_COLORS, TIER_LABELS } from '../data/housewives';
import { FRANCHISES } from '../data/franchises';
import { renderTrades } from './trades';

// ── Episode log (localStorage persistence) ─────────────────────────────────

const LOG_KEY = 'thl_ep_log';

interface VoteSession {
  ep: number;
  tally: Record<string, number>;
  submittedAt: string;
}

function getLog(): VoteSession[] {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) ?? '[]'); }
  catch { return []; }
}

function saveLog(sessions: VoteSession[]) {
  try { localStorage.setItem(LOG_KEY, JSON.stringify(sessions)); } catch {}
}

function getNextEp(): number {
  const log = getLog();
  return log.length + 1;
}

const MAX_ROSTER = 10;
export const roster: Set<string> = new Set();

// ── Helpers ────────────────────────────────────────────────────────────────

function getFranchise(id: string) { return FRANCHISES.find(f => f.id === id); }
function getFranchiseColor(id: string) { return getFranchise(id)?.color ?? '#7a5c68'; }
function getFranchiseAbbr(id: string) { return getFranchise(id)?.abbr ?? id.toUpperCase(); }
function getInitials(name: string) { return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase(); }

function updateRosterHeader() {
  const el = document.getElementById('roster-count');
  if (el) el.textContent = `${roster.size} / ${MAX_ROSTER} Players Drafted`;
}

function updateRosterValue() {
  const el = document.getElementById('roster-value');
  if (!el) return;
  const total = HOUSEWIVES.filter(h => roster.has(h.id)).reduce((s, h) => s + h.fantasyValue, 0);
  el.textContent = total.toLocaleString();
}

// ── Roster ─────────────────────────────────────────────────────────────────

function renderRosterGrid() {
  const grid = document.getElementById('roster-grid');
  if (!grid) return;

  const drafted = HOUSEWIVES.filter(h => roster.has(h.id));
  const empty = MAX_ROSTER - drafted.length;

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

  const emptyHTML = Array.from({ length: empty }, (_, i) => `
    <div class="roster-slot empty">
      <div class="rs-icon">◇</div>
      <div class="rs-label">Open Slot ${drafted.length + i + 1}</div>
    </div>`).join('');

  grid.innerHTML = draftedHTML + emptyHTML;
  grid.querySelectorAll<HTMLElement>('.rs-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      roster.delete(btn.dataset.id!);
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
}

// ── Draft Pool ─────────────────────────────────────────────────────────────

function renderDraftPool() {
  const pool = document.getElementById('draft-pool');
  if (!pool) return;

  const available = HOUSEWIVES.filter(h => !roster.has(h.id))
    .sort((a, b) => b.fantasyValue - a.fantasyValue);

  pool.innerHTML = available.map(h => {
    const fc = getFranchiseColor(h.primaryFranchise);
    const abbr = getFranchiseAbbr(h.primaryFranchise);
    const tc = TIER_COLORS[h.tier];
    const canDraft = roster.size < MAX_ROSTER;
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
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (roster.size >= MAX_ROSTER) return;
      roster.add(btn.dataset.id!);
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
let votesSubmitted = false;

function buildPlayerOptions(): string {
  if (roster.size === 0) {
    return '<option value="">Draft players first to vote</option>';
  }
  const drafted = HOUSEWIVES.filter(h => roster.has(h.id));
  return '<option value="">— Select a player —</option>' +
    drafted.map(h => `<option value="${h.id}">${h.name} (${getFranchiseAbbr(h.primaryFranchise)})</option>`).join('');
}

function renderVoting() {
  const panel = document.getElementById('vote-panel');
  if (!panel) return;

  if (votesSubmitted) {
    const total = Object.values(votes).reduce((sum, pid) => {
      return sum + (VOTE_CATS.find(c => Object.keys(votes).some(k => votes[k] === pid)) ? 0 : 0);
    }, 0);

    // tally points per player
    const tally: Record<string, number> = {};
    VOTE_CATS.forEach(cat => {
      const pid = votes[cat.key];
      if (pid) tally[pid] = (tally[pid] ?? 0) + cat.pts;
    });

    const resultsHtml = Object.entries(tally)
      .sort(([, a], [, b]) => b - a)
      .map(([pid, pts]) => {
        const h = HOUSEWIVES.find(hw => hw.id === pid);
        if (!h) return '';
        const tc = TIER_COLORS[h.tier];
        return `
          <div class="vote-result-row">
            <span class="vr-name">${h.name}</span>
            <span class="vr-pts" style="color:${tc}">+${pts} pts</span>
          </div>`;
      }).join('');

    panel.innerHTML = `
      <div class="vote-header">
        <div class="vote-eyebrow">Episode Results</div>
        <div class="vote-title">Your Votes Submitted</div>
        <div class="vote-sub">Points will apply at the end of the episode window.</div>
      </div>
      <div class="vote-results">
        <div class="vr-label">Fantasy Points This Episode</div>
        ${resultsHtml || '<div style="padding:16px 18px;color:var(--muted);font-size:11px">No roster players received votes.</div>'}
      </div>
      <div style="padding:16px 18px;border-top:1px solid var(--border)">
        <button class="pm-draft-btn" id="vote-reset-btn" style="width:100%">Clear & Vote Again</button>
      </div>`;

    document.getElementById('vote-reset-btn')?.addEventListener('click', () => {
      votesSubmitted = false;
      Object.keys(votes).forEach(k => delete votes[k]);
      renderVoting();
    });
    return;
  }



  const hasRoster = roster.size > 0;
  panel.innerHTML = `
    <div class="vote-header">
      <div class="vote-eyebrow">Community Voting</div>
      <div class="vote-title">Episode Voting</div>
      <div class="vote-sub">${hasRoster
        ? 'Cast your votes. Points apply to your drafted players.'
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
        <button class="vote-submit-btn" id="vote-submit">Submit Votes</button>
      </div>` : ''}`;

  panel.querySelectorAll<HTMLSelectElement>('.vote-select').forEach(sel => {
    sel.value = votes[sel.dataset.cat!] ?? '';
    sel.addEventListener('change', () => {
      votes[sel.dataset.cat!] = sel.value;
    });
  });

  document.getElementById('vote-submit')?.addEventListener('click', () => {
    votesSubmitted = true;
    // Tally and persist to episode log
    const tally: Record<string, number> = {};
    VOTE_CATS.forEach(cat => {
      const pid = votes[cat.key];
      if (pid) tally[pid] = (tally[pid] ?? 0) + cat.pts;
    });
    const log = getLog();
    log.push({ ep: getNextEp(), tally, submittedAt: new Date().toISOString() });
    saveLog(log);
    renderVoting();
  });
}

// ── League Creation ─────────────────────────────────────────────────────────

let leagueName = '';
let leagueMode: 'solo' | 'create' | 'join' | null = null;

function renderLeaguePanel() {
  const panel = document.getElementById('league-panel');
  if (!panel) return;

  if (leagueMode === 'solo' || leagueName) {
    const displayName = leagueName || 'Solo Fantasy Mode';
    panel.innerHTML = `
      <div class="league-active">
        <div class="la-eyebrow">Your League</div>
        <div class="la-name">${displayName}</div>
        <div class="la-standings-label">Standings</div>
        <div class="league-item">
          <div class="li-rank">1</div>
          <div class="li-name" style="font-style:italic">You</div>
          <div class="li-pts">${calcRosterPts()} pts</div>
        </div>
        <div class="league-item" style="opacity:.25">
          <div class="li-rank">2</div>
          <div class="li-name">Waiting for players…</div>
          <div class="li-pts">0 pts</div>
        </div>
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
      <div id="ls-form" style="display:none;margin-top:16px">
        <input class="ls-input" id="ls-name-input" type="text" placeholder="League name…" maxlength="40">
        <div class="ls-size-row">
          <span style="font-size:10px;color:var(--muted)">Size:</span>
          <button class="ls-size-btn active" data-size="4">4</button>
          <button class="ls-size-btn" data-size="6">6</button>
          <button class="ls-size-btn" data-size="8">8</button>
          <button class="ls-size-btn" data-size="10">10</button>
        </div>
        <button class="ls-submit-btn" id="ls-submit">Launch League</button>
      </div>
    </div>`;

  document.getElementById('ls-create')?.addEventListener('click', () => {
    document.getElementById('ls-form')!.style.display = 'block';
    (document.getElementById('ls-create') as HTMLButtonElement).style.display = 'none';
  });
  document.getElementById('ls-solo')?.addEventListener('click', () => {
    leagueMode = 'solo';
    renderLeaguePanel();
  });
  document.getElementById('ls-join')?.addEventListener('click', () => {
    document.getElementById('ls-form')!.style.display = 'block';
    (document.getElementById('ls-create') as HTMLButtonElement).style.display = 'none';
  });
  document.getElementById('ls-submit')?.addEventListener('click', () => {
    const input = document.getElementById('ls-name-input') as HTMLInputElement;
    leagueName = input.value.trim() || 'My THL League';
    leagueMode = 'create';
    renderLeaguePanel();
  });

  panel.querySelectorAll<HTMLElement>('.ls-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      panel.querySelectorAll('.ls-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function calcRosterPts(): number {
  return HOUSEWIVES.filter(h => roster.has(h.id))
    .reduce((s, h) => s + Math.floor(h.fantasyValue / 100), 0);
}

// ── Episode Log ────────────────────────────────────────────────────────────

export function renderEpisodeLog() {
  const panel = document.getElementById('episode-log-panel');
  if (!panel) return;

  const log = getLog();

  if (log.length === 0) {
    panel.innerHTML = `
      <div class="elog-empty">
        <div class="elog-empty-icon">◇</div>
        <div class="elog-empty-msg">No episodes logged yet</div>
        <div class="elog-empty-sub">Submit your episode votes in the Command Center to begin tracking fantasy points</div>
      </div>`;
    return;
  }

  const allTimeTotals: Record<string, number> = {};
  log.forEach(session => {
    Object.entries(session.tally).forEach(([pid, pts]) => {
      allTimeTotals[pid] = (allTimeTotals[pid] ?? 0) + pts;
    });
  });

  const sorted = Object.entries(allTimeTotals).sort(([, a], [, b]) => b - a);

  const leaderboard = sorted.slice(0, 10).map(([pid, pts], i) => {
    const h = HOUSEWIVES.find(hw => hw.id === pid);
    if (!h) return '';
    const tc = TIER_COLORS[h.tier];
    const fc = getFranchiseColor(h.primaryFranchise);
    return `
      <div class="elog-ldr-row">
        <div class="elr-rank">${i + 1}</div>
        <div class="elr-avatar" style="border-color:${fc}">${getInitials(h.name)}</div>
        <div class="elr-name">${h.name}</div>
        <div class="elr-pts" style="color:${tc}">+${pts} pts</div>
      </div>`;
  }).join('');

  const sessionHistory = [...log].reverse().map((s, i) => {
    const epNum = log.length - i;
    const topPids = Object.entries(s.tally).sort(([, a], [, b]) => b - a).slice(0, 3);
    const mvp = topPids[0] ? HOUSEWIVES.find(h => h.id === topPids[0][0]) : null;
    return `
      <div class="elog-session">
        <div class="els-header">
          <span class="els-ep">Episode ${epNum}</span>
          <span class="els-date">${new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        ${topPids.map(([pid, pts]) => {
          const h = HOUSEWIVES.find(hw => hw.id === pid);
          if (!h) return '';
          const tc = TIER_COLORS[h.tier];
          return `<div class="els-row"><span class="els-name">${h.name}</span><span style="color:${tc}">+${pts} pts</span></div>`;
        }).join('')}
        ${topPids.length === 0 ? '<div class="els-row" style="color:var(--muted)">No roster players voted</div>' : ''}
      </div>`;
  }).join('');

  panel.innerHTML = `
    <div class="elog-layout">
      <div class="elog-col">
        <div class="elog-col-header">
          <span class="elog-col-label">Season Leaderboard</span>
          <span class="elog-col-hint">${log.length} episode${log.length !== 1 ? 's' : ''} tracked</span>
        </div>
        <div class="elog-leaderboard">${leaderboard || '<div style="padding:16px;color:var(--muted);font-size:11px">No roster players scored yet</div>'}</div>
        <button class="elog-clear-btn" id="elog-clear">Clear All Episode Data</button>
      </div>
      <div class="elog-col">
        <div class="elog-col-header">
          <span class="elog-col-label">Episode History</span>
        </div>
        <div class="elog-sessions">${sessionHistory}</div>
      </div>
    </div>`;

  document.getElementById('elog-clear')?.addEventListener('click', () => {
    if (confirm('Clear all episode voting history?')) {
      saveLog([]);
      votesSubmitted = false;
      Object.keys(votes).forEach(k => delete votes[k]);
      renderEpisodeLog();
    }
  });
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
      if (tab === 'command') { renderRosterGrid(); renderDraftPool(); updateRosterHeader(); updateRosterValue(); }
    });
  });

  // Listen for trade completions from trades module
  document.addEventListener('thl:trade-complete', () => {
    refresh();
  });
}

// ── Fantasy Analytics (D3) ─────────────────────────────────────────────────

function renderAnalyticsChart() {
  const el = document.getElementById('fantasy-analytics-chart');
  if (!el || el.dataset.init) return;
  el.dataset.init = '1';

  const rosterList = HOUSEWIVES.filter(h => roster.has(h.id))
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
  renderRosterGrid();
  renderDraftPool();
  renderVoting();
  renderLeaguePanel();

  document.addEventListener('thl:navigate', (e: Event) => {
    if ((e as CustomEvent).detail === 'fantasy') {
      renderAnalyticsChart();
    }
  });
}
