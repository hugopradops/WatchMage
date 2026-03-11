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

export async function GET() {
  const cached = getCached<CriticResult>('metacritic', 60 * 60 * 1000);
  if (cached) return NextResponse.json(cached);

  try {
    const response = await fetch('https://api.opencritic.com/api/game/popular', {
      headers: { 'User-Agent': 'MageTrack/1.0' },
    });

    if (!response.ok) throw new Error(`OpenCritic API returned ${response.status}`);
    const data = await response.json();

    const games: CriticGame[] = data
      .filter(
        (g: { topCriticScore?: number }) => g.topCriticScore && g.topCriticScore > 0,
      )
      .map(
        (g: {
          id: number;
          name: string;
          topCriticScore: number;
          tier?: string;
          firstReleaseDate?: string;
          Platforms?: Array<{ shortName?: string }>;
          images?: {
            banner?: { og?: string };
            box?: { og?: string };
          };
        }) => ({
          id: g.id,
          name: g.name,
          score: Math.round(g.topCriticScore),
          tier: g.tier || 'N/A',
          releaseDate: g.firstReleaseDate || null,
          platforms: (g.Platforms || []).map((p) => p.shortName).filter(Boolean),
          image:
            g.images && g.images.banner && g.images.banner.og
              ? `https://img.opencritic.com/${g.images.banner.og}`
              : g.images && g.images.box && g.images.box.og
                ? `https://img.opencritic.com/${g.images.box.og}`
                : null,
          url: `https://opencritic.com/game/${g.id}/${encodeURIComponent(
            g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          )}`,
        }),
      )
      .slice(0, 9);

    const result: CriticResult = { games };
    if (games.length > 0) setCache('metacritic', result);
    return NextResponse.json(result);
  } catch (err) {
    console.error('OpenCritic error:', (err as Error).message);
    return NextResponse.json({ error: 'Failed to load critic scores' }, { status: 500 });
  }
}
