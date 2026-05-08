// Vercel Serverless Function: GET /api/search?q=<query>
export default async function handler(req, res) {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.status(400).json({ error: 'q must be at least 2 characters' });

  const key = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherapi.com/v1/search.json?key=${key}&q=${encodeURIComponent(q)}`;

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json(data);
    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
