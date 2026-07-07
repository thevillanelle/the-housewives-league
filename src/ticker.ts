interface NewsItem {
  headline: string;
  source: string;
}

const FALLBACK_ITEMS = [
  { text: 'THE HOUSEWIVES LEAGUE', cls: 'accent' },
  { text: '·', cls: 'sep' },
  { text: 'The global fantasy sports layer for reality television', cls: '' },
  { text: '·', cls: 'sep' },
  { text: 'RHOC · RHONY · RHOA · RHONJ · RHOBH · RHOM · RHOP · RHOSLC · RHODubai · RHORI', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'Melbourne · Sydney · Auckland · Cheshire · London · Amsterdam · Antwerp', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'Johannesburg · Durban · Lagos · Nairobi · Cape Town · Pretoria', cls: 'gold' },
  { text: '·', cls: 'sep' },
  { text: 'Athens · Naples · Rome · Munich · Warsaw · Budapest · Ljubljana · Helsinki', cls: 'gold' },
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
  return items
    .map(item =>
      item.cls === 'sep'
        ? `<span class="ticker-sep">${item.text}</span>`
        : `<span class="ticker-item${item.cls ? ' ' + item.cls : ''}">${item.text}</span>`
    )
    .join('');
}

function renderFallback(inner: HTMLElement) {
  const doubled = [...FALLBACK_ITEMS, ...FALLBACK_ITEMS];
  inner.innerHTML = buildItemsHTML(doubled);
}

function renderLiveNews(inner: HTMLElement, news: NewsItem[]) {
  const items: { text: string; cls: string }[] = [];

  for (const n of news) {
    items.push({ text: n.headline, cls: '' });
    items.push({ text: `— ${n.source}`, cls: 'gold' });
    items.push({ text: '·', cls: 'sep' });
  }

  // Append franchise universe items at the end
  items.push(...FALLBACK_ITEMS);

  // Double for seamless loop
  const doubled = [...items, ...items];
  inner.innerHTML = buildItemsHTML(doubled);
}

export async function initTicker() {
  const inner = document.getElementById('ticker-inner');
  if (!inner) return;

  // Show fallback immediately so ticker starts moving
  renderFallback(inner);

  // Fetch live news in background
  try {
    const res = await fetch('/api/news');
    if (res.ok) {
      const data = await res.json() as { items: NewsItem[] };
      if (data.items && data.items.length > 0) {
        renderLiveNews(inner, data.items);
      }
    }
  } catch {
    // Fallback already displayed — nothing to do
  }
}
