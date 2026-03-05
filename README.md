# MageTrack

A mage-themed gaming dashboard that aggregates Steam sales countdowns, upcoming PC game releases, Steam hardware info, and gaming news into a single page.

## Features

- **Steam Sale Countdown** -- Live countdown timer to the next Steam sale with a "LIVE NOW" indicator when a sale is active.
- **Upcoming PC/Steam Releases** -- Grid of the most-wishlisted upcoming games on Steam, pulled from the Steam store and appdetails APIs. Filtered to only show games with confirmed release dates.
- **Steam Hardware** -- Catalog of Valve hardware devices (Steam Deck, Steam Machine, Steam Controller, Steam Frame VR) with availability status and specs.
- **Gaming News** -- Latest articles aggregated from PC Gamer, Kotaku, and Rock Paper Shotgun RSS feeds.

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Runtime  | Node.js                     |
| Backend  | Express.js                  |
| Frontend | Vanilla HTML / CSS / JS     |
| Data     | Steam APIs, RSS feeds, local JSON files |

No build step, no bundler, no database.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- npm (comes with Node.js)

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the server**

   ```bash
   npm start
   ```

3. **Open in your browser**

   ```
   http://localhost:3000
   ```

## API Endpoints

| Endpoint              | Description                                      | Cache TTL  |
|-----------------------|--------------------------------------------------|------------|
| `GET /api/steam-sales`   | Next/active Steam sale with countdown dates   | None       |
| `GET /api/releases`      | Most-wishlisted upcoming games from Steam     | 1 hour     |
| `GET /api/steam-hardware` | Valve hardware catalog with specs            | None       |
| `GET /api/news`          | Latest 15 articles from gaming RSS feeds      | 30 minutes |

## Project Structure

```
MageTrack/
├── server.js               # Express server and API routes
├── package.json
├── data/
│   ├── steam-sales.json    # Upcoming Steam sale dates
│   └── steam-hardware.json # Steam hardware catalog
└── public/
    ├── index.html          # Single-page dashboard shell
    ├── css/
    │   └── style.css       # Styles, animations, responsive layout
    └── js/
        └── app.js          # Client-side fetch, rendering, particle effects
```

## Configuration

The server runs on port **3000** by default (hardcoded in `server.js`). There are no environment variables or external configuration files required.

## Data Sources

- **Steam Sales** -- `data/steam-sales.json` (manually maintained list of sale dates)
- **Steam Hardware** -- `data/steam-hardware.json` (manually maintained device catalog)
- **Upcoming Releases** -- Live from the [Steam Store search API](https://store.steampowered.com) and [Steam appdetails API](https://store.steampowered.com/api/appdetails)
- **Gaming News** -- Live RSS feeds from PC Gamer, Kotaku, and Rock Paper Shotgun

## License

ISC
