# Critic Scores API Options

OpenCritic API now requires an API key (no longer free without one).

## No Key Required

### Steam Store API
- **Metacritic scores:** `https://store.steampowered.com/api/appdetails?appids={appid}`
  - Returns `metacritic.score` and `metacritic.url` when available
- **User reviews:** `https://store.steampowered.com/appreviews/{appid}?json=1`
  - Returns user sentiment (e.g. "Very Positive"), not critic scores
- **Limitation:** Need to know Steam app IDs; user reviews, not professional critics

## Free Key Required (Free Sign-up, No Credit Card)

### RAWG API (Recommended)
- **URL:** `https://api.rawg.io/api/games`
- **Sign up:** https://rawg.io/apidocs
- **Data:** Game metadata, Metacritic ratings, genres, release dates, screenshots, platforms
- **Limit:** Free under 100k monthly active users
- **Best fit:** Returns Metacritic scores directly, closest to what we had

### OpenCritic via RapidAPI
- **URL:** https://rapidapi.com/opencritic-opencritic-default/api/opencritic-api
- **Data:** Aggregated critic scores from major outlets (IGN, GameSpot, Polygon, etc.)
- **Limit:** Rate-limited on free tier

### IGDB (Internet Game Database)
- **URL:** `https://api.igdb.com/v4/games`
- **Auth:** Requires Twitch OAuth client credentials (free via Twitch dev portal)
- **Data:** Aggregated ratings, critic reviews, release info, platforms, cover art

## RSS Feeds (No Auth, XML)

### GameSpot
- Reviews: `https://www.gamespot.com/feeds/reviews/`
- News: `https://www.gamespot.com/feeds/news/`
- Note: Titles and summaries only, no scores inline
