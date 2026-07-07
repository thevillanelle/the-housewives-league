import type { VercelRequest, VercelResponse } from '@vercel/node';

const RH_KEYWORDS = [
  'real housewives', 'rhony', 'rhoa', 'rhobh', 'rhonj', 'rhoc', 'rhom',
  'rhop', 'rhoslc', 'rhod', 'rhodu', 'rhori', 'housewife', 'housewives',
  'bravo tv', 'bravo reality', 'vanderpump', 'below deck', 'shahs of sunset',
];

interface NewsItem {
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
}

// Parse RSS XML titles and links via regex — no external deps needed
function parseRSS(xml: string, sourceName: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?\s*(.*?)\s*(?:\]\]>)?<\/title>/i);
    const linkMatch = block.match(/<link>([^<]+)<\/link>/i)
      ?? block.match(/<guid[^>]*>([^<]+)<\/guid>/i);
    const pubMatch = block.match(/<pubDate>([^<]+)<\/pubDate>/i);

    const title = titleMatch?.[1]?.trim().replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"');
    const url = linkMatch?.[1]?.trim() ?? '';
    const pub = pubMatch?.[1]?.trim() ?? new Date().toUTCString();

    if (!title) continue;

    const lower = title.toLowerCase();
    const isRelevant = RH_KEYWORDS.some(kw => lower.includes(kw));
    if (!isRelevant) continue;

    items.push({ headline: title, source: sourceName, url, publishedAt: pub });
  }

  return items;
}

const FEEDS = [
  { url: 'https://realityblurb.com/feed/', name: 'Reality Blurb' },
  { url: 'https://allaboutthetea.com/feed/', name: 'All About The Tea' },
  { url: 'https://tvline.com/feed/', name: 'TVLine' },
];

async function fetchFeed(feed: { url: string; name: string }): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'TheHousewivesLeague/1.0' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSS(xml, feed.name);
  } catch {
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  try {
    const results = await Promise.all(FEEDS.map(fetchFeed));
    const all = results
      .flat()
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 30);

    res.status(200).json({ items: all, fetched_at: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news', items: [] });
  }
}
