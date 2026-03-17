# WatchMage

A mage-themed gaming dashboard that aggregates Steam sales countdowns, upcoming PC game releases, community review scores, and gaming news into a single page.

## Features

- **Steam Sale Countdown** -- Live countdown timer to the next Steam sale with a "LIVE NOW" indicator when a sale is active.
- **Upcoming PC/Steam Releases** -- Grid of the most-wishlisted upcoming games on Steam, pulled from the Steam store and appdetails APIs. Filtered to only show games with confirmed release dates.
- **Community Reviews** -- Trending and popular games sourced from Steam's featured categories, showing user review percentages and sentiment tiers (e.g. Very Positive, Overwhelmingly Positive).
- **Gaming News** -- Latest articles aggregated from PC Gamer, Kotaku, and Rock Paper Shotgun RSS feeds with pagination.

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Framework | Next.js 15 (App Router)             |
| Language  | TypeScript                          |
| Frontend  | React 19                            |
| Styling   | Global CSS with CSS variables       |
| Fonts     | Outfit & Inter via next/font/google |
| Data      | Steam APIs, RSS feeds, local JSON   |

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the dev server**

   ```bash
   npm run dev
   ```

3. **Open in your browser**

   ```
   http://localhost:3000
   ```

## API Endpoints

| Endpoint               | Description                                 | Cache TTL  |
| ---------------------- | ------------------------------------------- | ---------- |
| `GET /api/steam-sales` | Next/active Steam sale with countdown dates | None       |
| `GET /api/releases`    | Most-wishlisted upcoming games from Steam   | 1 hour     |
| `GET /api/metacritic`  | Trending games with Steam user reviews      | 1 hour     |
| `GET /api/news`        | Latest 15 articles from gaming RSS feeds    | 30 minutes |

## Project Structure

```
WatchMage/
├── app/
│   ├── layout.tsx              # Root layout with fonts and metadata
│   ├── page.tsx                # Dashboard page composing all components
│   ├── globals.css             # All styles, animations, responsive layout
│   ├── api/
│   │   ├── steam-sales/route.ts
│   │   ├── releases/route.ts
│   │   ├── metacritic/route.ts
│   │   └── news/route.ts
│   └── components/
│       ├── ParticleCanvas.tsx  # Animated particle background
│       ├── MageLogo.tsx        # SVG mage logo
│       ├── TopBar.tsx          # Header with stat pills and live clock
│       ├── SaleCard.tsx        # Steam sale countdown
│       ├── ReleasesCard.tsx    # Upcoming releases grid
│       ├── CriticScoresCard.tsx # Community review scores list
│       └── NewsCard.tsx        # Paginated gaming news
├── lib/
│   ├── cache.ts               # In-memory cache utility
│   └── utils.ts               # HTML entity decoder
├── data/
│   └── steam-sales.json       # Upcoming Steam sale dates
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Data Sources

- **Steam Sales** -- `data/steam-sales.json` (manually maintained list of sale dates)
- **Upcoming Releases** -- Live from the [Steam Store search API](https://store.steampowered.com) and [Steam appdetails API](https://store.steampowered.com/api/appdetails)
- **Community Reviews** -- Live from the [Steam featured categories API](https://store.steampowered.com/api/featuredcategories/) and [Steam user reviews API](https://store.steampowered.com/appreviews/)
- **Gaming News** -- Live RSS feeds from PC Gamer, Kotaku, and Rock Paper Shotgun

## License

ISC
