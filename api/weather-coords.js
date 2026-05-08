// Vercel Serverless Function: GET /api/weather-coords?lat=<lat>&lon=<lon>
export default async function handler(req, res) {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });

  const key = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${lat},${lon}&days=5&aqi=yes&alerts=no`;

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json(data);
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
