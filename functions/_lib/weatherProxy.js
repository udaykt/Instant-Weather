// weatherProxy.js — shared WeatherAPI proxy for all Cloudflare Pages Functions.
// One implementation, used by /api/weather, /api/weather-coords, /api/search.
//
// Key rotation: WEATHER_API_KEYS is a comma-separated pool. We start at a
// random key (stateless load-spread) and, on a quota/disabled error, fail
// over to the next key automatically. If every key is exhausted we return
// HTTP 429 { error: 'quota_exhausted' } so the UI can tell the user to retry.
//
// Files/dirs prefixed with "_" are not routed by Cloudflare Pages, so this
// is import-only shared code.

const BASE = 'https://api.weatherapi.com/v1';

// WeatherAPI error codes that mean "this key is spent / can't serve this":
//   1002 API key not provided     2006 invalid key
//   2007 monthly quota exceeded   2008 key disabled
//   2009 plan has no access to the resource
const KEY_EXHAUSTED_CODES = new Set([1002, 2006, 2007, 2008, 2009]);

function getKeys(env) {
  const pool = (env.WEATHER_API_KEYS || env.WEATHER_API_KEY || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  // Random rotation offset so traffic spreads across keys without shared state.
  if (pool.length > 1) {
    const start = Math.floor(Math.random() * pool.length);
    return pool.slice(start).concat(pool.slice(0, start));
  }
  return pool;
}

const json = (body, status, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });

/**
 * @param {string} path  WeatherAPI path, e.g. "/forecast.json" or "/search.json"
 * @param {Record<string,string>} params  query params (without the key)
 * @param {object} env  Cloudflare env bindings
 */
export async function proxyWeather(path, params, env) {
  const keys = getKeys(env);
  if (keys.length === 0) {
    return json({ error: 'server_misconfigured' }, 500);
  }

  const qs = new URLSearchParams(params).toString();

  for (const key of keys) {
    let upstream;
    try {
      upstream = await fetch(`${BASE}${path}?key=${key}&${qs}`);
    } catch {
      continue; // network blip — try the next key
    }

    const data = await upstream.json().catch(() => null);

    if (upstream.ok) {
      // Edge-cache successful responses so repeat lookups don't burn quota.
      return json(data, 200, {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
      });
    }

    const code = data && data.error && data.error.code;
    if (code && KEY_EXHAUSTED_CODES.has(code)) {
      continue; // this key is spent — fail over to the next one
    }

    // A real client/upstream error (bad city, etc.) — surface it as-is.
    return json(data ?? { error: 'upstream_error' }, upstream.status);
  }

  // Every key in the pool is exhausted.
  return json(
    { error: 'quota_exhausted', message: 'All API keys exhausted. Please try again later.' },
    429,
  );
}

export { json };
