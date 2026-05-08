// Netlify Function: GET /api/search?q=<query>
export const handler = async (event) => {
  const q = event.queryStringParameters?.q;
  if (!q || q.trim().length < 2) return { statusCode: 400, body: JSON.stringify({ error: 'q must be at least 2 characters' }) };

  const key = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherapi.com/v1/search.json?key=${key}&q=${encodeURIComponent(q)}`;

  try {
    const res  = await fetch(url);
    const data = await res.json();
    return {
      statusCode: res.ok ? 200 : res.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=60' },
      body: JSON.stringify(data),
    };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
