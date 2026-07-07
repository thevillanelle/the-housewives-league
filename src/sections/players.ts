import { HOUSEWIVES, TIER_COLORS, TIER_LABELS, type Housewife } from '../data/housewives';
import { FRANCHISES } from '../data/franchises';
import { activeFranchiseId, setActiveFranchise } from '../state';

const STATUS_LABELS: Record<string, string> = {
  current: 'Current',
  former: 'Former',
  friend_of: 'Friend Of',
  legend: 'Legend',
};

let activeFilter = 'all';
let searchQuery = '';
let franchiseFilter: string | null = null;

function getFranchise(id: string) {
  return FRANCHISES.find(f => f.id === id);
}

function getFranchiseColor(id: string): string {
  return getFranchise(id)?.color ?? '#7a5c68';
}

function getFranchiseAbbr(id: string): string {
  return getFranchise(id)?.abbr ?? id.toUpperCase();
}

function getInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function renderFranchiseChip() {
  const chip = document.getElementById('players-franchise-chip');
  if (!chip) return;

  if (franchiseFilter) {
    const f = getFranchise(franchiseFilter);
    const name = f?.name ?? franchiseFilter.toUpperCase();
    const color = f?.color ?? '#b5426a';
    chip.innerHTML = `
      <div class="pfc-inner" style="border-color:${color}44;background:${color}11">
        <span class="pfc-dot" style="background:${color}"></span>
        <span class="pfc-name" style="color:${color}">${name}</span>
        <button class="pfc-clear" id="pfc-clear-btn">✕ Show All</button>
      </div>
    `;
    chip.style.display = 'block';
    document.getElementById('pfc-clear-btn')?.addEventListener('click', () => {
      franchiseFilter = null;
      setActiveFranchise(null);
      renderFranchiseChip();
      renderGrid();
    });
  } else {
    chip.style.display = 'none';
  }
}

function renderCard(h: Housewife): string {
  const tierColor = TIER_COLORS[h.tier];
  const franchiseColor = getFranchiseColor(h.primaryFranchise);
  const abbr = getFranchiseAbbr(h.primaryFranchise);

  // show all franchise badges if she's appeared in multiple
  const franchiseBadges = h.franchises.length > 1
    ? h.franchises.map(fid => {
        const fc = getFranchise(fid);
        return `<span class="pc-franchise" style="background:${fc?.color ?? franchiseColor}22;color:${fc?.color ?? franchiseColor};border:1px solid ${fc?.color ?? franchiseColor}44">${fc?.abbr ?? fid.toUpperCase()}</span>`;
      }).join('')
    : `<span class="pc-franchise" style="background:${franchiseColor}22;color:${franchiseColor};border:1px solid ${franchiseColor}44">${abbr}</span>`;

  return `
    <div class="player-card" data-id="${h.id}" style="--fc:${franchiseColor};--tc:${tierColor}">
      <div class="pc-stripe"></div>
      <div class="pc-body">
        <div class="pc-top">
          <div class="pc-avatar" style="border-color:${franchiseColor}">
            <span>${getInitials(h.name)}</span>
          </div>
          <div class="pc-value-block">
            <div class="pc-value">${h.fantasyValue.toLocaleString()}</div>
            <div class="pc-value-label">Fantasy Value</div>
          </div>
        </div>
        <div class="pc-name">${h.name}</div>
        <div class="pc-meta-row">${franchiseBadges}<span class="pc-tier" style="color:${tierColor}">${TIER_LABELS[h.tier]}</span></div>
        <div class="pc-tagline">"${h.tagline}"</div>
        <div class="pc-stats">
          <div class="pc-stat">
            <div class="pc-stat-val">${h.seasonsCount}</div>
            <div class="pc-stat-lbl">Seasons</div>
          </div>
          <div class="pc-stat">
            <div class="pc-stat-val">${h.debutYear}</div>
            <div class="pc-stat-lbl">Debut</div>
          </div>
          <div class="pc-stat">
            <div class="pc-stat-val pc-stat-status ${h.status}">${STATUS_LABELS[h.status]}</div>
            <div class="pc-stat-lbl">Status</div>
          </div>
        </div>
        <div class="pc-highlights">
          ${h.careerHighlights.slice(0, 2).map(hl => `<div class="pc-highlight">· ${hl}</div>`).join('')}
        </div>
        <button class="pc-draft-btn">+ Add to Roster</button>
      </div>
    </div>
  `;
}

function renderGrid() {
  const grid = document.getElementById('players-grid');
  if (!grid) return;

  let list = [...HOUSEWIVES];

  // franchise filter takes priority — show all women from that franchise
  if (franchiseFilter) {
    list = list.filter(h => h.franchises.includes(franchiseFilter!) || h.primaryFranchise === franchiseFilter);
  }

  // tier/status filter on top of franchise filter
  if (activeFilter !== 'all') {
    if (['legendary', 'elite', 'premium', 'standard', 'developing'].includes(activeFilter)) {
      list = list.filter(h => h.tier === activeFilter);
    } else if (['current', 'former', 'legend', 'friend_of'].includes(activeFilter)) {
      list = list.filter(h => h.status === activeFilter);
    }
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.tagline.toLowerCase().includes(q) ||
      h.careerHighlights.some(hl => hl.toLowerCase().includes(q))
    );
  }

  list.sort((a, b) => b.fantasyValue - a.fantasyValue);

  const countEl = document.getElementById('players-showing');
  if (countEl) {
    countEl.textContent = franchiseFilter
      ? `${list.length} players · ${getFranchise(franchiseFilter)?.abbr ?? franchiseFilter}`
      : `${list.length} players`;
  }

  if (list.length === 0) {
    grid.innerHTML = '<div style="padding:48px;text-align:center;color:var(--muted);font-family:Space Mono,monospace;font-size:11px;letter-spacing:2px">NO PLAYERS MATCH THIS FILTER</div>';
    return;
  }

  grid.innerHTML = list.map(renderCard).join('');

  grid.querySelectorAll<HTMLElement>('.pc-draft-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.textContent = '✓ On Roster';
      btn.style.background = 'rgba(181,66,106,.18)';
      btn.style.color = 'var(--accent)';
      btn.style.borderColor = 'rgba(181,66,106,.4)';
      btn.disabled = true;
    });
  });

  grid.querySelectorAll<HTMLElement>('.player-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.pc-draft-btn')) return;
      const id = card.dataset.id!;
      document.dispatchEvent(new CustomEvent('thl:open-player', { detail: id }));
    });
  });
}

export function initPlayers() {
  document.getElementById('players-filter-bar')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.players-filter-btn');
    if (!btn) return;
    document.querySelectorAll('.players-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter ?? 'all';
    renderGrid();
  });

  const searchInput = document.getElementById('players-search') as HTMLInputElement | null;
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value.trim();
    renderGrid();
  });

  // When navigating to Players, pick up any active franchise from sidebar
  document.addEventListener('thl:navigate', (e: Event) => {
    if ((e as CustomEvent).detail !== 'players') return;
    const incoming = activeFranchiseId;
    if (incoming && incoming !== franchiseFilter) {
      franchiseFilter = incoming;
      // reset tier filter so franchise context is clean
      activeFilter = 'all';
      document.querySelectorAll('.players-filter-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.players-filter-btn[data-filter="all"]')?.classList.add('active');
      if (searchInput) searchInput.value = '';
      searchQuery = '';
    }
    renderFranchiseChip();
    renderGrid();
  });

  renderGrid();
}
