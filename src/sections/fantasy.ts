import { HOUSEWIVES, TIER_COLORS, TIER_LABELS, type Housewife } from '../data/housewives';
import { FRANCHISES } from '../data/franchises';

const MAX_ROSTER = 10;
const roster: Set<string> = new Set();

function getFranchiseColor(id: string): string {
  return FRANCHISES.find(f => f.id === id)?.color ?? '#7a5c68';
}

function getFranchiseAbbr(id: string): string {
  return FRANCHISES.find(f => f.id === id)?.abbr ?? id.toUpperCase();
}

function getInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function updateRosterHeader() {
  const el = document.getElementById('roster-count');
  if (el) el.textContent = `${roster.size} / ${MAX_ROSTER} Players Drafted`;
}

function renderRosterGrid() {
  const grid = document.getElementById('roster-grid');
  if (!grid) return;

  const drafted = HOUSEWIVES.filter(h => roster.has(h.id));
  const emptySlots = MAX_ROSTER - drafted.length;

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
            <div class="rs-meta">
              <span style="color:${fc};font-size:8px;font-weight:700;letter-spacing:1px;text-transform:uppercase">${abbr}</span>
              <span style="color:${tc};font-size:8px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-left:6px">${TIER_LABELS[h.tier]}</span>
            </div>
          </div>
          <div class="rs-value">${h.fantasyValue.toLocaleString()}</div>
          <button class="rs-remove" data-id="${h.id}">✕</button>
        </div>
      </div>
    `;
  }).join('');

  const emptyHTML = Array.from({ length: emptySlots }, (_, i) => `
    <div class="roster-slot empty">
      <div class="rs-icon">◇</div>
      <div class="rs-label">Open Slot ${drafted.length + i + 1}</div>
    </div>
  `).join('');

  grid.innerHTML = draftedHTML + emptyHTML;

  grid.querySelectorAll<HTMLElement>('.rs-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id!;
      roster.delete(id);
      renderRosterGrid();
      renderDraftPool();
      updateRosterHeader();
      updateRosterValue();
    });
  });
}

function updateRosterValue() {
  const el = document.getElementById('roster-value');
  if (!el) return;
  const total = HOUSEWIVES.filter(h => roster.has(h.id)).reduce((sum, h) => sum + h.fantasyValue, 0);
  el.textContent = total.toLocaleString();
}

function renderDraftPool() {
  const pool = document.getElementById('draft-pool');
  if (!pool) return;

  const available = HOUSEWIVES
    .filter(h => !roster.has(h.id))
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
          <div class="dp-meta">
            <span style="color:${fc}">${abbr}</span>
            <span style="color:${tc};margin-left:6px">${TIER_LABELS[h.tier]}</span>
          </div>
        </div>
        <div class="dp-value">${h.fantasyValue.toLocaleString()}</div>
        <button class="dp-draft-btn ${canDraft ? '' : 'disabled'}" data-id="${h.id}" ${canDraft ? '' : 'disabled'}>
          ${canDraft ? 'Draft' : 'Full'}
        </button>
      </div>
    `;
  }).join('');

  pool.querySelectorAll<HTMLElement>('.dp-draft-btn:not(.disabled)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id!;
      if (roster.size >= MAX_ROSTER) return;
      roster.add(id);
      renderRosterGrid();
      renderDraftPool();
      updateRosterHeader();
      updateRosterValue();
    });
  });
}

function renderVotePanel() {
  const panel = document.getElementById('vote-panel');
  if (!panel) return;

  const categories = [
    { key: 'mvp', label: 'Episode MVP', pts: 10, desc: 'Who ran this episode?' },
    { key: 'confessional', label: 'Best Confessional', pts: 5, desc: 'Most iconic talking-head moment' },
    { key: 'read', label: 'Best Read', pts: 5, desc: 'Who delivered the best read?' },
    { key: 'moment', label: 'Best Moment', pts: 5, desc: 'The scene everyone will remember' },
    { key: 'drama', label: 'Drama Impact', pts: 5, desc: 'Biggest story driver this episode' },
  ];

  panel.innerHTML = `
    <div class="vote-header">
      <div class="vote-eyebrow">Community Voting</div>
      <div class="vote-title">Episode Voting Opens After Airing</div>
      <div class="vote-sub">Votes determine point allocation. Results finalize 48 hours post-episode.</div>
    </div>
    <div class="vote-cats">
      ${categories.map(c => `
        <div class="vote-cat">
          <div class="vc-top">
            <span class="vc-label">${c.label}</span>
            <span class="vc-pts">+${c.pts} pts</span>
          </div>
          <div class="vc-desc">${c.desc}</div>
          <div class="vc-locked">
            <span class="vc-lock-icon">◈</span> Opens when episode airs
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function initFantasy() {
  renderRosterGrid();
  renderDraftPool();
  renderVotePanel();
  updateRosterHeader();
  updateRosterValue();
}
