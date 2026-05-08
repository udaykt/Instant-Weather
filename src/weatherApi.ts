// weatherApi.ts — typed API client with 10-minute localStorage cache

import type { WeatherResponse, CityResult } from './types';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = isLocal ? 'http://localhost:5000' : '';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
  data: T;
  ts: number;
}

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return entry.data;
  } catch { return null; }
}

function setCache<T>(key: string, data: T): void {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() } satisfies CacheEntry<T>)); } catch {}
}

async function fetchJSON<T>(url: string, cacheKey?: string): Promise<T> {
  if (cacheKey) {
    const hit = getCached<T>(cacheKey);
    if (hit) return hit;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as T;
  if (cacheKey) setCache(cacheKey, data);
  return data;
}

export function getResultsByCity(city: string): Promise<WeatherResponse> {
  const q = city.trim() || 'London';
  return fetchJSON<WeatherResponse>(
    `${API_BASE}/api/weather?city=${encodeURIComponent(q)}`,
    `city:${q.toLowerCase()}`,
  );
}

export function getResultsByCoords(lat: number, lon: number): Promise<WeatherResponse> {
  return fetchJSON<WeatherResponse>(
    `${API_BASE}/api/weather-coords?lat=${lat}&lon=${lon}`,
    `coords:${lat.toFixed(2)},${lon.toFixed(2)}`,
  );
}

export async function searchCities(query: string): Promise<CityResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query.trim())}`);
    return res.ok ? (res.json() as Promise<CityResult[]>) : [];
  } catch { return []; }
}
