// weatherApi.ts — typed API client with 10-minute localStorage cache

import type { WeatherResponse, CityResult } from './types';
import { WeatherResponseSchema, CityResultsSchema } from './schemas';

// Always use relative paths. In dev, Vite proxies /api/* → localhost:5000.
// In production, Netlify/Vercel intercept /api/* with their serverless functions.
const API_BASE = '';
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
    if (Date.now() - entry.ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() } satisfies CacheEntry<T>));
  } catch {}
}

async function fetchRaw(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getResultsByCity(city: string): Promise<WeatherResponse> {
  const q = city.trim() || 'London';
  const cacheKey = `city:${q.toLowerCase()}`;
  const cached = getCached<WeatherResponse>(cacheKey);
  if (cached) return cached;
  const data = WeatherResponseSchema.parse(
    await fetchRaw(`${API_BASE}/api/weather?city=${encodeURIComponent(q)}`),
  );
  setCache(cacheKey, data);
  return data;
}

export async function getResultsByCoords(lat: number, lon: number): Promise<WeatherResponse> {
  const cacheKey = `coords:${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = getCached<WeatherResponse>(cacheKey);
  if (cached) return cached;
  const data = WeatherResponseSchema.parse(
    await fetchRaw(`${API_BASE}/api/weather-coords?lat=${lat}&lon=${lon}`),
  );
  setCache(cacheKey, data);
  return data;
}

export async function searchCities(query: string): Promise<CityResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    return CityResultsSchema.parse(await res.json());
  } catch {
    return [];
  }
}
