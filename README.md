# OddsHub

A mobile app that shows live odds/implied-probability across Polymarket,
Kalshi, and (later) traditional sportsbooks — all in one place.

## Structure

```
apps/
├── server/   Next.js API backend — fetches, normalizes, and caches odds
└── mobile/   Expo (React Native) app — the phone UI
```

The mobile app never talks to Polymarket or Kalshi directly. It calls the
server, which normalizes both sources into one shared shape
(`apps/server/src/lib/types.ts`):

```ts
interface OddsEvent {
  id: string;
  source: "polymarket" | "kalshi";
  sport: string;
  title: string;
  outcomes: { name: string; impliedProbability: number }[];
  volume: number;
  closeTime: string | null;
  sourceUrl: string;
}
```

This is the key seam: adding a sportsbook data source later (e.g. The Odds
API for FanDuel/DraftKings moneyline/spread/total) just means writing one
more `fetch*Events()` function in `apps/server/src/lib/` that returns this
same shape — the mobile app doesn't change.

## Data sources (v1)

- **Polymarket** — public `gamma-api.polymarket.com`, no API key. On-chain
  prediction market, so prices/volume are public by design.
- **Kalshi** — public `api.elections.kalshi.com`, no API key needed for
  reading market data (only placing real trades needs auth, which this app
  never does).

Both endpoints are best-effort: if a live fetch fails or returns nothing,
the server falls back to clearly-tagged demo data (`demo: true` in the
response) so the app is always exercisable end-to-end.

## Running it locally

**1. Install everything from the repo root** (npm workspaces):

```
npm install
```

**2. Start the server:**

```
npm run server:dev
```

This runs `apps/server` on `http://localhost:3000`. Try
`http://localhost:3000/api/events?sport=nfl` in a browser.

**3. Start the mobile app:**

```
npm run mobile:start
```

This opens Expo dev tools — scan the QR code with the Expo Go app on your
phone, or press `i`/`a` for a simulator.

**Important — set the API URL for your phone.** `localhost` on a physical
phone means the phone itself, not your computer. Before starting the app,
set `EXPO_PUBLIC_API_URL` to your computer's LAN IP:

```
EXPO_PUBLIC_API_URL=http://192.168.1.23:3000 npm run mobile:start
```

(Find your LAN IP with `ipconfig getifaddr en0` on Mac, or `ipconfig` on
Windows. Your phone and computer must be on the same Wi-Fi network.)

## Roadmap

- [x] Polymarket + Kalshi, normalized into one feed, by sport
- [x] Mobile list view: side-by-side implied probabilities, pull-to-refresh
- [ ] Match the same real-world game across sources (fuzzy title matching)
      so one card shows both platforms' numbers together
- [ ] Sportsbook odds (FanDuel/DraftKings/etc.) via The Odds API — adds
      moneyline, spread, and total in American-odds format
- [ ] Event detail screen (full outcome breakdown, link out to source)
- [ ] Favoriting / push alerts on line moves
- [ ] Deploy the server (Vercel) so the app doesn't depend on your laptop
