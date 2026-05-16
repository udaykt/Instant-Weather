// GET /api/search?q=<query>  — city autocomplete
import { proxyWeather, json } from '../_lib/weatherProxy.js';

export async function onRequestGet({ request, env }) {
  const q = new URL(request.url).searchParams.get('q');
  if (!q) return json({ error: 'q is required' }, 400);
  return proxyWeather('/search.json', { q }, env);
}
