import { FRANCHISES, type FranchiseRegion } from '../data/franchises';
import { openFranchise } from '../sidebar';
import { navigateTo } from '../nav';

const REGION_LABELS: Record<string, string> = {
  'north-america': 'North America',
  oceania: 'Oceania',
  africa: 'Africa',
  'middle-east': 'Middle East',
  europe: 'Europe',
  'south-america': 'South America',
  asia: 'Asia',
};

let activeFilter = 'all';

export function initUniverse() {
  document.getElementById('uni-filters')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.uni-filter-btn');
    if (!btn) return;
    document.querySelectorAll('.uni-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter ?? 'all';
    renderGrid();
  });

  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('uni-grid');
  if (!grid) return;

  let list = [...FRANCHISES];

  if (activeFilter === 'status-active') {
    list = list.filter(f => f.status === 'active');
  } else if (activeFilter !== 'all') {
    list = list.filter(f => f.region === activeFilter);
  }

  // Group by region for ordered display
  const order: FranchiseRegion[] = [
    'north-america', 'europe', 'africa', 'oceania', 'middle-east', 'south-america', 'asia',
  ];
  if (activeFilter === 'all') {
    list.sort((a, b) => order.indexOf(a.region) - order.indexOf(b.region) || a.debutYear - b.debutYear);
  }

  grid.innerHTML = list.map(f => `
    <div class="franchise-card" style="--fc:${f.color}" data-id="${f.id}">
      <div class="fc-top">
        <span class="fc-abbr">${f.abbr}</span>
        <span class="fc-badge ${f.status}">${f.status}</span>
      </div>
      <div class="fc-name">${f.name}</div>
      <div class="fc-meta">
        <span>${f.shortName}, ${f.country}</span>
        <span>${f.debutYear}</span>
        <span>${f.seasonsCount} season${f.seasonsCount !== 1 ? 's' : ''}</span>
        <span>${f.network}</span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll<HTMLElement>('.franchise-card').forEach(card => {
    card.addEventListener('click', () => {
      const franchise = FRANCHISES.find(f => f.id === card.dataset.id);
      if (!franchise) return;
      navigateTo('globe');
      setTimeout(() => openFranchise(franchise), 350);
    });
  });
}
