import { type Franchise } from './data/franchises';
import { HOUSEWIVES, TIER_COLORS, TIER_LABELS } from './data/housewives';

const REGION_LABELS: Record<string, string> = {
  'north-america': 'North America',
  oceania: 'Oceania',
  africa: 'Africa',
  'middle-east': 'Middle East',
  europe: 'Europe',
  'south-america': 'South America',
  asia: 'Asia',
};

function getInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

export function initSidebar() {
  document.getElementById('sidebar-close')?.addEventListener('click', closeSidebar);
}

export function openFranchise(f: Franchise) {
  const sidebar = document.getElementById('sidebar')!;

  (document.getElementById('sb-region') as HTMLElement).textContent =
    REGION_LABELS[f.region] ?? f.region;

  const abbrEl = document.getElementById('sb-abbr') as HTMLElement;
  abbrEl.textContent = f.abbr;
  abbrEl.style.color = f.color;

  (document.getElementById('sb-name') as HTMLElement).textContent = f.name;
  (document.getElementById('sb-location') as HTMLElement).textContent =
    `${f.shortName}, ${f.country}`;
  (document.getElementById('sb-debut') as HTMLElement).textContent = String(f.debutYear);
  (document.getElementById('sb-seasons') as HTMLElement).textContent = String(f.seasonsCount);
  (document.getElementById('sb-desc') as HTMLElement).textContent = f.description;
  (document.getElementById('sb-network') as HTMLElement).textContent = `Network: ${f.network}`;

  const statusEl = document.getElementById('sb-status') as HTMLElement;
  statusEl.className = `sb-status ${f.status}`;
  (document.getElementById('sb-status-text') as HTMLElement).textContent =
    f.status === 'hiatus' ? 'On Hiatus' :
    f.status.charAt(0).toUpperCase() + f.status.slice(1);

  // Notable cast from this franchise
  const castEl = document.getElementById('sb-cast');
  if (castEl) {
    const cast = HOUSEWIVES
      .filter(h => h.franchises.includes(f.id) || h.primaryFranchise === f.id)
      .sort((a, b) => b.fantasyValue - a.fantasyValue)
      .slice(0, 6);

    if (cast.length > 0) {
      castEl.innerHTML = `
        <div class="sb-cast-label">Notable Cast</div>
        <div class="sb-cast-grid">
          ${cast.map(h => {
            const tc = TIER_COLORS[h.tier];
            return `
              <div class="sb-cast-card">
                <div class="sb-cast-avatar" style="border-color:${f.color}">${getInitials(h.name)}</div>
                <div class="sb-cast-info">
                  <div class="sb-cast-name">${h.name}</div>
                  <div class="sb-cast-tier" style="color:${tc}">${TIER_LABELS[h.tier]}</div>
                </div>
                <div class="sb-cast-val" style="color:${tc}">${h.fantasyValue.toLocaleString()}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      castEl.style.display = 'block';
    } else {
      castEl.style.display = 'none';
    }
  }

  sidebar.classList.add('open');
}

export function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
}
