// GET /api/weather?city=<name>
import { proxyWeather, json } from '../_lib/weatherProxy.js';

export async function onRequestGet({ request, env }) {
  const city = new URL(request.url).searchParams.get('city');
  if (!city) return json({ error: 'city is required' }, 400);
  return proxyWeather(
    '/forecast.json',
    { q: city, days: '5', aqi: 'yes', alerts: 'yes' },
    env,
  );
}
