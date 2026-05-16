// forecastService.ts — typed API client with 10-minute localStorage cache

import type { WeatherResponse, CityResult } from '@/shared/types/weatherTypes';
import { WeatherResponseSchema, CityResultsSchema } from '@/shared/schemas/forecastSchemas';

// Relative paths resolve to /api/* in both dev (Vite plugin) and prod (serverless functions).
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

/** Thrown when every key in the rotation pool has hit its quota. */
export class QuotaExhaustedError extends Error {
  constructor(message = 'All API keys exhausted. Please try again later.') {
    super(message);
    this.name = 'QuotaExhaustedError';
  }
}

async function fetchRaw(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (res.status === 429) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
      message?: string;
    } | null;
    if (body?.error === 'quota_exhausted') throw new QuotaExhaustedError(body.message);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchForecastByCity(location: string): Promise<WeatherResponse> {
  const q = location.trim() || 'London';
  const forecastCacheKey = `weather:city:${q.toLowerCase()}`;
  const cached = getCached<WeatherResponse>(forecastCacheKey);
  if (cached) return cached;
  const forecastData = WeatherResponseSchema.parse(
    await fetchRaw(`${API_BASE}/api/weather?city=${encodeURIComponent(q)}`),
  );
  setCache(forecastCacheKey, forecastData);
  return forecastData;
}

export async function fetchForecastByCoords(lat: number, lon: number): Promise<WeatherResponse> {
  const forecastCacheKey = `weather:coords:${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = getCached<WeatherResponse>(forecastCacheKey);
  if (cached) return cached;
  const forecastData = WeatherResponseSchema.parse(
    await fetchRaw(`${API_BASE}/api/weather-coords?lat=${lat}&lon=${lon}`),
  );
  setCache(forecastCacheKey, forecastData);
  return forecastData;
}

export async function fetchCitySuggestions(query: string): Promise<CityResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    return CityResultsSchema.parse(await res.json());
  } catch {
    return [];
  }
}
