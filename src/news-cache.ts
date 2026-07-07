export interface NewsItem {
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
}

let cache: NewsItem[] | null = null;
let fetchPromise: Promise<NewsItem[]> | null = null;

export async function getNews(): Promise<NewsItem[]> {
  if (cache) return cache;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('/api/news')
    .then(r => r.ok ? r.json() : { items: [] })
    .then((data: { items: NewsItem[] }) => {
      cache = data.items ?? [];
      return cache;
    })
    .catch(() => {
      cache = [];
      return cache;
    });

  return fetchPromise;
}

export function filterForFranchise(items: NewsItem[], keywords: string[]): NewsItem[] {
  const lower = keywords.map(k => k.toLowerCase());
  return items.filter(item => {
    const h = item.headline.toLowerCase();
    return lower.some(k => h.includes(k));
  });
}
