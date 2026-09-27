export default function Home() {
  return (
    <main style={{ fontFamily: "monospace", padding: 24 }}>
      <h1>OddsHub API</h1>
      <p>This is the backend for the OddsHub mobile app. Try:</p>
      <ul>
        <li>
          <a href="/api/games?sport=nfl">/api/games?sport=nfl</a> — per-game moneylines, merged
        </li>
        <li>
          <a href="/api/events?sport=nfl">/api/events?sport=nfl</a>
        </li>
        <li>
          <a href="/api/polymarket?sport=nfl">/api/polymarket?sport=nfl</a>
        </li>
        <li>
          <a href="/api/kalshi?sport=nfl">/api/kalshi?sport=nfl</a>
        </li>
      </ul>
    </main>
  );
}
