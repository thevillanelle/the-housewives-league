import { getNews, filterForFranchise, type NewsItem } from './news-cache';

// ── module state ─────────────────────────────────────────────────────────────
let rafId = 0;
let scrollPos = 0;
let inner: HTMLElement | null = null;
let currentItems: NewsItem[] = [];

// ── article preview ──────────────────────────────────────────────────────────
function relativeTime(pubDate: string): string {
  const diff = Date.now() - new Date(pubDate).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago`
    : new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function openArticlePreview(item: NewsItem) {
  const panel = document.getElementById('article-preview');
  const apHeadline = document.getElementById('ap-headline');
  const apSource = document.getElementById('ap-source');
  const apLink = document.getElementById('ap-link') as HTMLAnchorElement | null;
  if (!panel || !apHeadline || !apSource || !apLink) return;

  apHeadline.textContent = item.headline;
  apSource.textContent = `${item.source}  ·  ${relativeTime(item.publishedAt)}`;
  apLink.href = item.url;
  panel.classList.add('open');
}

export function closeArticlePreview() {
  document.getElementById('article-preview')?.classList.remove('open');
}

// ── scroll engine ─────────────────────────────────────────────────────────────
function startScroll(el: HTMLElement) {
  cancelAnimationFrame(rafId);
  scrollPos = 0;
  function tick() {
    scrollPos -= 0.6;
    const half = el.scrollWidth / 2;
    if (half > 0 && Math.abs(scrollPos) >= half) scrollPos = 0;
    el.style.transform = `translateX(${scrollPos}px)`;
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);
}

// ── content builders ──────────────────────────────────────────────────────────
const FALLBACK_SPANS = [
  { t: 'THE HOUSEWIVES LEAGUE', c: 'accent' },
  { t: '·', c: 'sep' },
  { t: 'The global fantasy sports layer for reality television', c: '' },
  { t: '·', c: 'sep' },
  { t: 'RHOC · RHONY · RHOA · RHONJ · RHOBH · RHOP · RHOSLC · RHODubai', c: 'gold' },
  { t: '·', c: 'sep' },
  { t: 'Melbourne · Sydney · Cheshire · Johannesburg · Durban · Lagos · Nairobi', c: 'gold' },
  { t: '·', c: 'sep' },
  { t: '185 Players · 44 Franchises · 7 Regions · 1 Universe', c: '' },
  { t: '·', c: 'sep' },
  { t: 'Draft the legends', c: '' },
  { t: '·', c: 'sep' },
  { t: 'Build the dynasty', c: 'accent' },
  { t: '·', c: 'sep' },
];

function fallbackHTML(): string {
  return FALLBACK_SPANS.map(({ t, c }) =>
    c === 'sep'
      ? `<span class="ticker-sep">${t}</span>`
      : `<span class="ticker-item${c ? ' ' + c : ''}">${t}</span>`
  ).join('');
}

function newsHTML(items: NewsItem[]): string {
  const parts: string[] = [];
  items.forEach((item, idx) => {
    const safe = item.headline.replace(/"/g, '&quot;');
    parts.push(
      `<button class="ticker-item ticker-news" data-idx="${idx}" title="${safe}">${item.headline}</button>`,
      `<span class="ticker-item gold">— ${item.source}</span>`,
      `<span class="ticker-sep">·</span>`,
    );
  });
  parts.push(...FALLBACK_SPANS.map(({ t, c }) =>
    c === 'sep'
      ? `<span class="ticker-sep">${t}</span>`
      : `<span class="ticker-item${c ? ' ' + c : ''}">${t}</span>`
  ));
  return parts.join('');
}

function setContent(html: string) {
  if (!inner) return;
  inner.innerHTML = html + html; // double for seamless loop
}

function setLabel(text: string) {
  const el = document.querySelector('.ticker-label');
  if (el) el.textContent = text;
}

// ── public API ────────────────────────────────────────────────────────────────

/** Switch the ticker to news filtered for a specific franchise. */
export async function setTickerFranchise(abbr: string, keywords: string[]) {
  setLabel(`${abbr} News`);
  const all = await getNews();
  const relevant = filterForFranchise(all, keywords);
  if (relevant.length > 0) {
    currentItems = relevant;
    setContent(newsHTML(relevant));
  } else {
    currentItems = all;
    setContent(all.length > 0 ? newsHTML(all) : fallbackHTML());
  }
}

/** Reset ticker back to global Housewives news. */
export async function resetTicker() {
  setLabel('THL News');
  const all = await getNews();
  if (all.length > 0) {
    currentItems = all;
    setContent(newsHTML(all));
  } else {
    currentItems = [];
    setContent(fallbackHTML());
  }
}

export async function initTicker() {
  inner = document.getElementById('ticker-inner');
  if (!inner) return;

  inner.style.animation = 'none';
  setContent(fallbackHTML());
  startScroll(inner);

  // Click delegation — open article preview inline
  inner.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-idx]') as HTMLElement | null;
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx ?? '');
    if (!isNaN(idx) && currentItems[idx]) openArticlePreview(currentItems[idx]);
  });

  // Close button for preview panel
  document.getElementById('ap-close')?.addEventListener('click', closeArticlePreview);

  // Load global news
  const all = await getNews();
  if (all.length > 0) {
    currentItems = all;
    setContent(newsHTML(all));
  }
}
