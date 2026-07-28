import { getNews, filterForFranchise, type NewsItem } from '../news-cache';
import { FRANCHISES } from '../data/franchises';

const NEWS_FRANCHISE_KEYWORDS: Record<string, string[]> = {
  rhoa:  ['atlanta', 'nene', 'kenya moore', 'kandi', 'porsha', 'phaedra', 'rhoa'],
  rhony: ['new york', 'ramona', 'luann', 'sonja', 'bethenny', 'dorinda', 'rhony'],
  rhobh: ['beverly hills', 'lisa vanderpump', 'kyle richards', 'erika jayne', 'kathy hilton', 'rhobh'],
  rhonj: ['new jersey', 'teresa giudice', 'melissa gorga', 'caroline manzo', 'rhonj'],
  rhoc:  ['orange county', 'tamra', 'vicki', 'heather dubrow', 'shannon', 'rhoc'],
  rhop:  ['potomac', 'gizelle', 'karen huger', 'candiace', 'rhop'],
  rhoslc:['salt lake', 'jen shah', 'heather gay', 'lisa barlow', 'meredith marks', 'rhoslc'],
  rhom:  ['miami', 'adriana', 'larsa', 'alexia', 'lisa hochstein', 'rhom'],
  rhodu: ['dubai', 'caroline stanbury', 'lesa milan', 'rhodu'],
  rhoj:  ['johannesburg', "jo'burg", 'rhoj'],
  rhol:  ['lagos', 'rhol'],
  'rhom-au': ['melbourne', 'gina liano', 'janet roach', 'gamble', 'rhom-au'],
};

let currentFilter = 'all';
let allItems: NewsItem[] = [];
let initialized = false;

function relativeTime(pubDate: string): string {
  const diff = Date.now() - new Date(pubDate).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago`
    : new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function detectFranchise(headline: string): string | null {
  const h = headline.toLowerCase();
  for (const [id, kws] of Object.entries(NEWS_FRANCHISE_KEYWORDS)) {
    if (kws.some(kw => h.includes(kw))) return id;
  }
  return null;
}

function renderCard(item: NewsItem): string {
  const franchiseId = detectFranchise(item.headline);
  const franchise = franchiseId ? FRANCHISES.find(f => f.id === franchiseId) : null;
  const badge = franchise
    ? `<span class="nc-badge" style="color:${franchise.color};border-color:${franchise.color}44;background:${franchise.color}11">${franchise.abbr}</span>`
    : '';
  const safe = item.url.replace(/"/g, '&quot;');
  return `
    <a class="news-card" href="${safe}" target="_blank" rel="noopener">
      <div class="nc-meta">
        <span class="nc-source">${item.source}</span>
        ${badge}
        <span class="nc-time">${relativeTime(item.publishedAt)}</span>
      </div>
      <div class="nc-headline">${item.headline}</div>
      <div class="nc-read">Read story →</div>
    </a>`;
}

function renderGrid(grid: HTMLElement, items: NewsItem[]) {
  if (items.length === 0) {
    grid.innerHTML = '<div class="news-empty">No recent news found for this filter.</div>';
    return;
  }
  grid.innerHTML = items.map(renderCard).join('');
}

export async function initNews() {
  if (initialized) return;
  initialized = true;

  const bar = document.getElementById('news-franchise-bar');
  const grid = document.getElementById('news-grid');
  const loadingEl = document.getElementById('news-loading');
  if (!bar || !grid || !loadingEl) return;

  const franchises = Object.keys(NEWS_FRANCHISE_KEYWORDS)
    .map(id => FRANCHISES.find(f => f.id === id))
    .filter((f): f is NonNullable<typeof f> => f != null)
    .sort((a, b) => a.abbr.localeCompare(b.abbr));

  bar.innerHTML = `
    <button class="nfb-btn active" data-franchise="all">All News</button>
    ${franchises.map(f =>
      `<button class="nfb-btn" data-franchise="${f.id}" data-color="${f.color}">${f.abbr}</button>`
    ).join('')}
  `;

  bar.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.nfb-btn');
    if (!btn) return;
    bar.querySelectorAll<HTMLElement>('.nfb-btn').forEach(b => {
      b.classList.remove('active');
      b.style.borderColor = '';
      b.style.color = '';
      b.style.background = '';
    });
    btn.classList.add('active');
    const color = btn.dataset.color ?? '';
    if (color) {
      btn.style.borderColor = color;
      btn.style.color = color;
      btn.style.background = `${color}22`;
    }
    currentFilter = btn.dataset.franchise ?? 'all';
    const keywords = currentFilter !== 'all' ? NEWS_FRANCHISE_KEYWORDS[currentFilter] ?? [] : [];
    renderGrid(grid, currentFilter === 'all' ? allItems : filterForFranchise(allItems, keywords));
  });

  loadingEl.style.display = 'block';
  allItems = await getNews();
  loadingEl.style.display = 'none';
  renderGrid(grid, allItems);
}
