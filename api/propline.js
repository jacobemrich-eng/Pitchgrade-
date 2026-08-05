// /api/propline.js
//
// Vercel serverless function that proxies requests to PropLine.
// The API key lives ONLY here, as an environment variable on the server
// (set in your Vercel project settings — never in this file, never in the
// frontend). The browser calls this endpoint; this endpoint calls PropLine.

const PROPLINE_BASE = "https://api.prop-line.com/v1";

// Only allow the specific PropLine paths this app actually needs.
// This stops the proxy from being used as an open relay for anything else.
const ALLOWED_PATHS = new Set([
  "/sports/baseball_mlb/events",
  "/sports/baseball_mlb/odds",
  "/sports/baseball_mlb/scores",
]);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.PROPLINE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing PROPLINE_API_KEY" });
  }

  const { path, ...query } = req.query;
  if (!path || !ALLOWED_PATHS.has(path)) {
    return res.status(400).json({ error: "Unknown or disallowed path" });
  }

  const url = new URL(PROPLINE_BASE + path);
  Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("apiKey", apiKey); // injected server-side only

  try {
    const upstream = await fetch(url.toString());
    const data = await upstream.json();

    // Cache for 60s at the edge — matches PropLine's own refresh cadence,
    // and keeps you well inside the free tier's daily request limit.
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Upstream request failed" });
  }
}
