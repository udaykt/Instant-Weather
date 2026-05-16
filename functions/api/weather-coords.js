// GET /api/weather-coords?lat=<lat>&lon=<lon>
import { proxyWeather, json } from '../_lib/weatherProxy.js';

export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  if (!lat || !lon) return json({ error: 'lat and lon are required' }, 400);
  return proxyWeather(
    '/forecast.json',
    { q: `${lat},${lon}`, days: '5', aqi: 'yes', alerts: 'yes' },
    env,
  );
}
