// weatherApi.js — secure proxy client with caching

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = isLocal ? 'http://localhost:5000' : '';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

function setCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

async function fetchJSON(url, cacheKey) {
  if (cacheKey) {
    const hit = getCached(cacheKey);
    if (hit) return hit;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (cacheKey) setCache(cacheKey, data);
  return data;
}

export function getResultsByCity(city) {
  const q = (city && city.trim()) ? city.trim() : 'London';
  return fetchJSON(`${API_BASE}/api/weather?city=${encodeURIComponent(q)}`, `city:${q.toLowerCase()}`);
}

export function getResultsByCoords(lat, lon) {
  return fetchJSON(`${API_BASE}/api/weather-coords?lat=${lat}&lon=${lon}`, `coords:${lat.toFixed(2)},${lon.toFixed(2)}`);
}

export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query.trim())}`);
    return res.ok ? res.json() : [];
  } catch { return []; }
}
