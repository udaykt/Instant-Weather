// Netlify Function: GET /api/weather-coords?lat=<lat>&lon=<lon>
export const handler = async (event) => {
  const { lat, lon } = event.queryStringParameters ?? {};
  if (!lat || !lon) return { statusCode: 400, body: JSON.stringify({ error: 'lat and lon are required' }) };

  const key = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${lat},${lon}&days=5&aqi=yes&alerts=yes`;

  try {
    const res  = await fetch(url);
    const data = await res.json();
    return {
      statusCode: res.ok ? 200 : res.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=600' },
      body: JSON.stringify(data),
    };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
