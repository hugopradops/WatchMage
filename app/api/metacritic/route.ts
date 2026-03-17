import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';

interface CriticGame {
  id: number;
  name: string;
  score: number;
  tier: string;
  releaseDate: string | null;
  platforms: string[];
  image: string | null;
  url: string;
}

interface CriticResult {
  games: CriticGame[];
}

function platformList(p: { windows?: boolean; mac?: boolean; linux?: boolean }): string[] {
  const list: string[] = [];
  if (p.windows) list.push('PC');
  if (p.mac) list.push('Mac');
  if (p.linux) list.push('Linux');
  return list;
}

async function fetchGameData(appId: number): Promise<CriticGame | null> {
  try {
    // Fetch app details and user reviews in parallel
    const [detailRes, reviewRes] = await Promise.all([
      fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`, {
        headers: { 'User-Agent': 'WatchMage/1.0' },
      }),
      fetch(
        `https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all&num_per_page=0`,
        { headers: { 'User-Agent': 'WatchMage/1.0' } },
      ),
    ]);

    if (!detailRes.ok || !reviewRes.ok) return null;

    const detailJson = await detailRes.json();
    const reviewJson = await reviewRes.json();

    const entry = detailJson[String(appId)];
    if (!entry?.success) return null;

    const d = entry.data;
    const summary = reviewJson.query_summary;
    if (!summary || summary.total_reviews < 10000) return null;

    const positivePercent = Math.round(
      (summary.total_positive / summary.total_reviews) * 100,
    );
    const tier = summary.review_score_desc || '';

    return {
      id: appId,
      name: d.name,
      score: positivePercent,
      tier,
      releaseDate: d.release_date?.date || null,
      platforms: platformList(d.platforms || {}),
      image: d.header_image || null,
      url: `https://store.steampowered.com/app/${appId}`,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const cached = getCached<CriticResult>('metacritic', 60 * 60 * 1000);
  if (cached) return NextResponse.json(cached);

  try {
    // Gather app IDs from multiple Steam categories
    const [catRes, featRes] = await Promise.all([
      fetch('https://store.steampowered.com/api/featuredcategories/', {
        headers: { 'User-Agent': 'WatchMage/1.0' },
      }),
      fetch('https://store.steampowered.com/api/featured/', {
        headers: { 'User-Agent': 'WatchMage/1.0' },
      }),
    ]);

    if (!catRes.ok) throw new Error(`Steam categories returned ${catRes.status}`);

    const catData = await catRes.json();
    const featData = featRes.ok ? await featRes.json() : {};

    // Collect unique app IDs from top sellers, new releases, specials, and featured
    const idSet = new Set<number>();
    for (const key of ['top_sellers', 'new_releases', 'specials']) {
      for (const item of catData[key]?.items || []) {
        idSet.add(item.id);
      }
    }
    for (const item of featData.featured_win || []) {
      idSet.add(item.id);
    }

    const appIds = [...idSet];
    if (appIds.length === 0) throw new Error('No games found from Steam');

    // Fetch details + reviews for all apps in parallel
    const results = await Promise.all(appIds.map(fetchGameData));

    // Filter valid games, keep discovery order, take top 9
    const games = results.filter((g): g is CriticGame => g !== null).slice(0, 9);

    const result: CriticResult = { games };
    if (games.length > 0) setCache('metacritic', result);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Steam critic scores error:', (err as Error).message);
    return NextResponse.json({ error: 'Failed to load critic scores' }, { status: 500 });
  }
}
