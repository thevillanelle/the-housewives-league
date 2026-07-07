import { type Franchise } from './data/franchises';
import { HOUSEWIVES, TIER_COLORS, TIER_LABELS } from './data/housewives';
import { setActiveFranchise } from './state';
import { getNews, filterForFranchise } from './news-cache';

const REGION_LABELS: Record<string, string> = {
  'north-america': 'North America',
  oceania: 'Oceania',
  africa: 'Africa',
  'middle-east': 'Middle East',
  europe: 'Europe',
  'south-america': 'South America',
  asia: 'Asia',
};

// Extra search terms per franchise id beyond name/abbr/shortName
const FRANCHISE_KEYWORDS: Record<string, string[]> = {
  rhoc: ['orange county', 'tamra', 'vicki', 'heather dubrow', 'shannon'],
  rhony: ['new york', 'ramona', 'luann', 'sonja', 'bethenny', 'dorinda'],
  rhoa: ['atlanta', 'nene', 'kenya moore', 'kandi', 'porsha', 'phaedra'],
  rhonj: ['new jersey', 'teresa giudice', 'melissa gorga', 'caroline manzo'],
  rhobh: ['beverly hills', 'lisa vanderpump', 'kyle richards', 'erika jayne', 'kathy hilton'],
  rhom: ['miami', 'adriana', 'larsa', 'alexia', 'lisa hochstein'],
  rhop: ['potomac', 'gizelle', 'karen huger', 'candiace'],
  rhoslc: ['salt lake', 'jen shah', 'heather gay', 'lisa barlow', 'meredith marks'],
  rhodu: ['dubai', 'caroline stanbury', 'lesa milan'],
  rhod: ['dallas', 'brandi redmond', 'stephanie hollman', 'leanne locken'],
  rhodc: ['washington dc', 'michaele salahi'],
  rhome: ['melbourne', 'gina liano', 'janet roach', 'gamble'],
  rhoch: ['cheshire', 'dawn ward'],
  rhori: ['rhode island'],
  rholo: ['london housewives', 'rho london'],
  rhoant: ['antwerp'],
  rhoath: ['athens housewives', 'rho athens'],
  rhonap: ['naples housewives'],
  rhome2: ['rome housewives'],
  rhowar: ['warsaw housewives'],
  rhobud: ['budapest housewives'],
  rhohel: ['helsinki housewives'],
  rhomun: ['munich housewives'],
  rhoj: ['johannesburg', 'jo\'burg'],
  rhodur: ['durban'],
  rholag: ['lagos'],
  rhonai: ['nairobi'],
  rhocpt: ['cape town'],
  rhojos: ['johannesburg', 'jo\'burg'],
};

function getInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function relativeTime(pubDate: string): string {
  const now = Date.now();
  const then = new Date(pubDate).getTime();
  const diff = now - then;
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildKeywords(f: Franchise): string[] {
  const base = [
    f.abbr.toLowerCase(),
    f.shortName.toLowerCase(),
    f.name.toLowerCase(),
    // pull first two words of name for partial match
    ...f.name.toLowerCase().split(' ').slice(0, 2),
  ];
  const extra = FRANCHISE_KEYWORDS[f.id] ?? [];
  return [...new Set([...base, ...extra])];
}

async function loadFranchiseNews(f: Franchise) {
  const newsEl = document.getElementById('sb-news');
  if (!newsEl) return;

  newsEl.style.display = 'block';
  newsEl.innerHTML = `
    <div class="sb-news-label">Latest News</div>
    <div class="sb-news-loading">Loading headlines…</div>`;

  const all = await getNews();
  const keywords = buildKeywords(f);
  const relevant = filterForFranchise(all, keywords).slice(0, 4);

  if (relevant.length === 0) {
    newsEl.innerHTML = `
      <div class="sb-news-label">Latest News</div>
      <div class="sb-news-empty">No recent news found for ${f.abbr}</div>`;
    return;
  }

  newsEl.innerHTML = `
    <div class="sb-news-label">Latest News</div>
    ${relevant.map(item => `
      <a class="sb-news-item" href="${item.url}" target="_blank" rel="noopener">
        <div class="sb-news-headline">${item.headline}</div>
        <div class="sb-news-meta">
          <span class="sb-news-source">${item.source}</span>
          <span class="sb-news-time">${relativeTime(item.publishedAt)}</span>
        </div>
      </a>`).join('')}`;
}

export function initSidebar() {
  document.getElementById('sidebar-close')?.addEventListener('click', closeSidebar);
}

export function openFranchise(f: Franchise) {
  setActiveFranchise(f.id);
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

  // Notable cast
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
              </div>`;
          }).join('')}
        </div>`;
      castEl.style.display = 'block';
    } else {
      castEl.style.display = 'none';
    }
  }

  sidebar.classList.add('open');

  // Load news async — news cache is shared so second click is instant
  loadFranchiseNews(f);
}

export function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
}
