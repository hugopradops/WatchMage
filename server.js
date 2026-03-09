const express = require('express');
const fetch = require('node-fetch');
const RSSParser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const rssParser = new RSSParser();

// --- In-memory cache ---
const cache = {};

function getCached(key, ttlMs) {
  const entry = cache[key];
  if (entry && Date.now() - entry.time < ttlMs) return entry.data;
  return null;
}

function setCache(key, data) {
  cache[key] = { data, time: Date.now() };
}

// --- Static files ---
app.use(express.static(path.join(__dirname, 'public')));

// --- API: Steam Sales ---
app.get('/api/steam-sales', (req, res) => {
  try {
    const raw = fs.readFileSync(path.join(__dirname, 'data', 'steam-sales.json'), 'utf-8');
    const data = JSON.parse(raw);
    const now = new Date();

    const upcoming = data.sales
      .map(s => ({ ...s, startDate: new Date(s.start), endDate: new Date(s.end) }))
      .filter(s => s.endDate > now)
      .sort((a, b) => a.startDate - b.startDate);

    const next = upcoming[0] || null;
    const active = next && next.startDate <= now;

    res.json({ next, active, allUpcoming: upcoming });
  } catch (err) {
    console.error('Steam sales error:', err.message);
    res.status(500).json({ error: 'Failed to load steam sales data' });
  }
});

// --- API: Gaming News (RSS) ---
app.get('/api/news', async (req, res) => {
  const cached = getCached('news', 30 * 60 * 1000);
  if (cached) return res.json(cached);

  const feeds = [
    { url: 'https://www.pcgamer.com/rss/', source: 'PC Gamer' },
    { url: 'https://kotaku.com/rss', source: 'Kotaku' },
    { url: 'https://www.rockpapershotgun.com/feed', source: 'Rock Paper Shotgun' },
  ];

  const articles = [];

  const feedPromises = feeds.map(async (feed) => {
    try {
      const parsed = await rssParser.parseURL(feed.url);
      return (parsed.items || []).slice(0, 5).map(item => ({
        title: item.title,
        link: item.link,
        date: item.pubDate || item.isoDate || null,
        source: feed.source,
      }));
    } catch (err) {
      console.error(`RSS error (${feed.source}):`, err.message);
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);
  for (const result of results) {
    if (result.status === 'fulfilled') articles.push(...result.value);
  }

  articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  const result = { articles: articles.slice(0, 15) };
  setCache('news', result);
  res.json(result);
});

// --- API: Upcoming Game Releases (Steam Most Wishlisted) ---
app.get('/api/releases', async (req, res) => {
  const cached = getCached('releases', 60 * 60 * 1000); // 1 hour
  if (cached) return res.json(cached);

  try {
    const games = await fetchSteamMostWishlisted();
    const result = { games };
    if (games.length > 0) {
      setCache('releases', result);
    }
    res.json(result);
  } catch (err) {
    console.error('Releases error:', err.message);
    res.json({ games: [] });
  }
});

async function fetchSteamMostWishlisted() {
  // Step 1: Get the most wishlisted upcoming games from Steam search
  const searchUrl = 'https://store.steampowered.com/search/results?sort_by=_ASC&filter=popularwishlist&category1=998&infinite=1&count=50';
  const searchResp = await fetch(searchUrl, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9' },
  });

  if (!searchResp.ok) {
    console.error('Steam search failed:', searchResp.status);
    return [];
  }

  const searchData = await searchResp.json();
  const html = searchData.results_html || '';

  // Parse app IDs and titles from the search HTML
  const appIdMatches = [...html.matchAll(/data-ds-appid="(\d+)"/g)];
  const titleMatches = [...html.matchAll(/<span class="title">(.*?)<\/span>/g)];
  const imageMatches = [...html.matchAll(/src="(https:\/\/[^"]*capsule[^"]+)"/g)];

  const entries = [];
  for (let i = 0; i < Math.min(appIdMatches.length, titleMatches.length); i++) {
    entries.push({
      appid: appIdMatches[i][1],
      name: decodeHTMLEntities(titleMatches[i][1]),
      searchImage: imageMatches[i] ? imageMatches[i][1] : null,
    });
  }

  // Step 2: Fetch details for each game in parallel (batched)
  const detailPromises = entries.slice(0, 40).map(async (entry) => {
    try {
      const detailUrl = `https://store.steampowered.com/api/appdetails?appids=${entry.appid}`;
      const resp = await fetch(detailUrl);
      if (!resp.ok) return entryToGame(entry);
      const data = await resp.json();
      const appData = data[entry.appid];
      if (!appData || !appData.success) return entryToGame(entry);

      const d = appData.data;
      return {
        name: d.name || entry.name,
        released: d.release_date ? d.release_date.date : null,
        comingSoon: d.release_date ? d.release_date.coming_soon : true,
        image: d.header_image || entry.searchImage,
        platforms: formatPlatforms(d.platforms),
        genres: (d.genres || []).map(g => g.description).slice(0, 3),
        description: d.short_description || '',
        appid: entry.appid,
      };
    } catch (err) {
      return entryToGame(entry);
    }
  });

  const games = await Promise.all(detailPromises);

  // Filter out games without a concrete release date (must have day + month + year)
  const dated = games.filter(g => {
    if (!g.released) return false;
    const lower = g.released.toLowerCase().trim();
    if (lower.includes('to be announced') || lower.includes('coming soon') || lower === 'tba') return false;
    // Reject dates that are just a year like "2026" or "Q2 2026"
    if (/^\d{4}$/.test(lower) || /^q\d/i.test(lower)) return false;
    const parsed = new Date(g.released);
    if (isNaN(parsed.getTime())) return false;
    // Must have a day component (not just "Mar 2026" which parses to 1st)
    // Check that the original string contains a digit that isn't just the year
    const hasDay = /\d{1,2}\s+\w+,?\s+\d{4}|\w+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2}/.test(g.released);
    return hasDay;
  });

  // Sort by soonest release date first
  dated.sort((a, b) => new Date(a.released) - new Date(b.released));

  return dated;
}

function entryToGame(entry) {
  return {
    name: entry.name,
    released: null,
    comingSoon: true,
    image: entry.searchImage ? entry.searchImage.replace('capsule_sm_120', 'header') : null,
    platforms: [],
    genres: [],
    description: '',
    appid: entry.appid,
  };
}

function formatPlatforms(platforms) {
  if (!platforms) return [];
  const result = [];
  if (platforms.windows) result.push('PC');
  if (platforms.mac) result.push('Mac');
  if (platforms.linux) result.push('Linux');
  return result;
}

function decodeHTMLEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&trade;/g, '\u2122')
    .replace(/&reg;/g, '\u00AE');
}

// --- API: Critic Scores (OpenCritic) ---
app.get('/api/metacritic', async (req, res) => {
  const cached = getCached('metacritic', 60 * 60 * 1000); // 1 hour cache
  if (cached) return res.json(cached);

  try {
    const response = await fetch('https://api.opencritic.com/api/game/popular', {
      headers: { 'User-Agent': 'MageTrack/1.0' },
    });

    if (!response.ok) throw new Error(`OpenCritic API returned ${response.status}`);
    const data = await response.json();

    const games = data
      .filter(g => g.topCriticScore && g.topCriticScore > 0)
      .map(g => ({
        id: g.id,
        name: g.name,
        score: Math.round(g.topCriticScore),
        tier: g.tier || 'N/A',
        releaseDate: g.firstReleaseDate || null,
        platforms: (g.Platforms || []).map(p => p.shortName).filter(Boolean),
        image: g.images && g.images.banner && g.images.banner.og
          ? `https://img.opencritic.com/${g.images.banner.og}`
          : g.images && g.images.box && g.images.box.og
            ? `https://img.opencritic.com/${g.images.box.og}`
            : null,
        url: `https://opencritic.com/game/${g.id}/${encodeURIComponent(g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`,
      }))
      .sort((a, b) => b.score - a.score);

    const result = { games };
    if (games.length > 0) setCache('metacritic', result);
    res.json(result);
  } catch (err) {
    console.error('OpenCritic error:', err.message);
    // Fallback: try local data if available
    try {
      const raw = fs.readFileSync(path.join(__dirname, 'data', 'metacritic.json'), 'utf-8');
      const fallback = JSON.parse(raw);
      res.json(fallback);
    } catch {
      res.status(500).json({ error: 'Failed to load critic scores' });
    }
  }
});

// --- Start server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MageTrack running at http://localhost:${PORT}`);
});
