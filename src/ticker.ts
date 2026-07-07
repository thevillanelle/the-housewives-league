interface NewsItem {
  headline: string;
  source: string;
}

const FALLBACK_ITEMS = [
  { text: 'THE HOUSEWIVES LEAGUE', cls: 'accent' },
  { text: '·', cls: 'sep' },
  { text: 'The global fantasy sports layer for reality television', cls: '' },
  { text: '·', cls: 'sep' },
  { text: 'RHOC · RHONY · RHOA · RHONJ · RHOBH · RHOP · RHOSLC · RHODubai', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'Melbourne · Sydney · Cheshire · London · Amsterdam · Antwerp', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'Johannesburg · Durban · Lagos · Nairobi · Cape Town', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'Athens · Naples · Rome · Munich · Warsaw · Helsinki', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'Watch the world', cls: '' },
  { text: '·', cls: 'sep' },
  { text: 'Draft the legends', cls: '' },
  { text: '·', cls: 'sep' },
  { text: 'Build the dynasty', cls: 'accent' },
  { text: '·', cls: 'sep' },
  { text: '44 Franchises · 7 Regions · 1 Universe', cls: '' },
  { text: '·', cls: 'sep' },
];

function buildItemsHTML(items: { text: string; cls: string }[]): string {
  return items.map(item =>
    item.cls === 'sep'
      ? `<span class="ticker-sep">${item.text}</span>`
      : `<span class="ticker-item${item.cls ? ' ' + item.cls : ''}">${item.text}</span>`
  ).join('');
}

function buildNewsItems(news: NewsItem[]): { text: string; cls: string }[] {
  const items: { text: string; cls: string }[] = [];
  for (const n of news) {
    items.push({ text: n.headline, cls: '' });
    items.push({ text: `— ${n.source}`, cls: 'gold' });
    items.push({ text: '·', cls: 'sep' });
  }
  return [...items, ...FALLBACK_ITEMS];
}

// JS-driven scroll — immune to innerHTML swap resets
let rafId = 0;
let scrollPos = 0;

function startScroll(inner: HTMLElement) {
  cancelAnimationFrame(rafId);
  scrollPos = 0;

  function tick() {
    scrollPos -= 0.6;
    const halfWidth = inner.scrollWidth / 2;
    if (halfWidth > 0 && Math.abs(scrollPos) >= halfWidth) {
      scrollPos = 0;
    }
    inner.style.transform = `translateX(${scrollPos}px)`;
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);
}

function setContent(inner: HTMLElement, items: { text: string; cls: string }[]) {
  // Double for seamless loop
  const doubled = [...items, ...items];
  inner.innerHTML = buildItemsHTML(doubled);
}

export async function initTicker() {
  const inner = document.getElementById('ticker-inner');
  if (!inner) return;

  // Remove CSS animation — JS drives it now
  inner.style.animation = 'none';

  setContent(inner, FALLBACK_ITEMS);
  startScroll(inner);

  try {
    const res = await fetch('/api/news');
    if (res.ok) {
      const data = await res.json() as { items: NewsItem[] };
      if (data.items && data.items.length > 0) {
        setContent(inner, buildNewsItems(data.items));
        // scrollPos keeps running — startScroll not called again so no jump
      }
    }
  } catch {
    // fallback already scrolling
  }
}
