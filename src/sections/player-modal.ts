import { HOUSEWIVES, TIER_COLORS, TIER_LABELS, type Housewife } from '../data/housewives';
import { FRANCHISES } from '../data/franchises';

function getFranchise(id: string) {
  return FRANCHISES.find(f => f.id === id);
}

function getInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

const STATUS_LABELS: Record<string, string> = {
  current: 'Current Cast',
  former: 'Former Cast',
  friend_of: 'Friend Of',
  legend: 'Legend',
};

const STATUS_COLORS: Record<string, string> = {
  current: '#10b981',
  former: '#7a5c68',
  friend_of: '#60a5fa',
  legend: '#d4af37',
};

function renderModal(h: Housewife) {
  const tierColor = TIER_COLORS[h.tier];
  const primaryF = getFranchise(h.primaryFranchise);
  const fc = primaryF?.color ?? '#7a5c68';

  const franchiseHistory = h.franchises.map(fid => {
    const f = getFranchise(fid);
    if (!f) return '';
    return `
      <div class="pm-franchise-row" style="border-left:3px solid ${f.color}">
        <span class="pm-fr-abbr" style="color:${f.color}">${f.abbr}</span>
        <span class="pm-fr-name">${f.name}</span>
        <span class="pm-fr-meta">${f.debutYear} · ${f.network}</span>
      </div>
    `;
  }).join('');

  const highlights = h.careerHighlights.map((hl, i) => `
    <div class="pm-hl-row">
      <div class="pm-hl-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="pm-hl-text">${hl}</div>
    </div>
  `).join('');

  const overlay = document.getElementById('player-modal-overlay')!;
  const content = document.getElementById('player-modal-content')!;

  content.innerHTML = `
    <button class="pm-close" id="pm-close">✕</button>
    <div class="pm-layout">
      <div class="pm-left">
        <div class="pm-avatar-wrap" style="border-color:${fc}">
          <div class="pm-avatar" style="border-color:${fc};color:${fc}">${getInitials(h.name)}</div>
        </div>
        <div class="pm-tier-badge" style="color:${tierColor};border-color:${tierColor}44;background:${tierColor}11">
          ${TIER_LABELS[h.tier]}
        </div>
        <div class="pm-status-badge" style="color:${STATUS_COLORS[h.status]};border-color:${STATUS_COLORS[h.status]}44;background:${STATUS_COLORS[h.status]}11">
          ${STATUS_LABELS[h.status]}
        </div>

        <div class="pm-stats-grid">
          <div class="pm-stat">
            <div class="pm-stat-val" style="color:var(--gold)">${h.fantasyValue.toLocaleString()}</div>
            <div class="pm-stat-lbl">Fantasy Value</div>
          </div>
          <div class="pm-stat">
            <div class="pm-stat-val">${h.seasonsCount}</div>
            <div class="pm-stat-lbl">Seasons</div>
          </div>
          <div class="pm-stat">
            <div class="pm-stat-val">${h.debutYear}</div>
            <div class="pm-stat-lbl">Debut</div>
          </div>
          <div class="pm-stat">
            <div class="pm-stat-val">${h.lastSeasonYear ?? '—'}</div>
            <div class="pm-stat-lbl">Last Season</div>
          </div>
        </div>

        <button class="pm-draft-btn" id="pm-draft-btn" data-id="${h.id}">
          + Add to Roster
        </button>
      </div>

      <div class="pm-right">
        <div class="pm-eyebrow">${primaryF?.name ?? ''}</div>
        <h2 class="pm-name" style="color:var(--text)">${h.name}</h2>
        <div class="pm-tagline">"${h.tagline}"</div>

        <div class="pm-section-label">Franchise History</div>
        <div class="pm-franchise-history">${franchiseHistory}</div>

        <div class="pm-section-label">Career Highlights</div>
        <div class="pm-highlights">${highlights}</div>
      </div>
    </div>
  `;

  overlay.classList.add('open');

  document.getElementById('pm-close')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  const draftBtn = document.getElementById('pm-draft-btn');
  if (draftBtn) {
    draftBtn.addEventListener('click', () => {
      draftBtn.textContent = '✓ On Roster';
      draftBtn.classList.add('drafted');
      (draftBtn as HTMLButtonElement).disabled = true;
    });
  }
}

function closeModal() {
  document.getElementById('player-modal-overlay')?.classList.remove('open');
}

export function initPlayerModal() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  document.addEventListener('thl:open-player', (e: Event) => {
    const id = (e as CustomEvent).detail as string;
    const h = HOUSEWIVES.find(hw => hw.id === id);
    if (h) renderModal(h);
  });
}

export function openPlayerModal(id: string) {
  const h = HOUSEWIVES.find(hw => hw.id === id);
  if (h) renderModal(h);
}
