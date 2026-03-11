import { NextResponse } from 'next/server';
import RSSParser from 'rss-parser';
import { getCached, setCache } from '@/lib/cache';

const rssParser = new RSSParser();

interface NewsResult {
  articles: Array<{
    title: string | undefined;
    link: string | undefined;
    date: string | null;
    source: string;
  }>;
}

export async function GET() {
  const cached = getCached<NewsResult>('news', 30 * 60 * 1000);
  if (cached) return NextResponse.json(cached);

  const feeds = [
    { url: 'https://www.pcgamer.com/rss/', source: 'PC Gamer' },
    { url: 'https://kotaku.com/rss', source: 'Kotaku' },
    { url: 'https://www.rockpapershotgun.com/feed', source: 'Rock Paper Shotgun' },
  ];

  const articles: NewsResult['articles'] = [];

  const feedPromises = feeds.map(async (feed) => {
    try {
      const parsed = await rssParser.parseURL(feed.url);
      return (parsed.items || []).slice(0, 5).map((item) => ({
        title: item.title,
        link: item.link,
        date: item.pubDate || item.isoDate || null,
        source: feed.source,
      }));
    } catch (err) {
      console.error(`RSS error (${feed.source}):`, (err as Error).message);
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);
  for (const result of results) {
    if (result.status === 'fulfilled') articles.push(...result.value);
  }

  articles.sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
  );
  const result: NewsResult = { articles: articles.slice(0, 12) };
  setCache('news', result);
  return NextResponse.json(result);
}
