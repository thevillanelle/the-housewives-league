import { type Franchise } from './data/franchises';

const REGION_LABELS: Record<string, string> = {
  'north-america': 'North America',
  oceania: 'Oceania',
  africa: 'Africa',
  'middle-east': 'Middle East',
  europe: 'Europe',
  'south-america': 'South America',
  asia: 'Asia',
};

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
    f.status.charAt(0).toUpperCase() + f.status.slice(1);

  sidebar.classList.add('open');
}

export function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
}
