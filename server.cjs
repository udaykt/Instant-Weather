// server.cjs — production-grade Express dev server
require('dotenv').config();
const express     = require('express');
const fetch       = require('node-fetch');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const NodeCache   = require('node-cache');
const path        = require('path');

const app  = express();
const PORT = process.env.PORT || 5000;
const KEY  = process.env.WEATHER_API_KEY;
const BASE = 'https://api.weatherapi.com/v1';

// Server-side forecast cache — 10-min TTL, checked every 2 min
const forecastCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());

const weatherApiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1-minute window
  max: 60,              // 60 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please slow down.' },
});
app.use('/api/', weatherApiLimiter);

// ─── Structured logger ────────────────────────────────────────────────────────
function log(level, route, msg, extra) {
  const entry = { time: new Date().toISOString(), level, route, msg, ...extra };
  // eslint-disable-next-line no-console
  (level === 'error' ? console.error : console.log)(JSON.stringify(entry));
}

// ─── WeatherAPI helper with server-side cache ─────────────────────────────────
async function fetchWeatherApi(url, forecastCacheKey, res) {
  const cached = forecastCache.get(forecastCacheKey);
  if (cached) {
    log('info', forecastCacheKey, 'cache hit');
    return res.json(cached);
  }
  const upstream = await fetch(url);
  const forecastData = await upstream.json();
  if (!upstream.ok) return res.status(upstream.status).json(forecastData);
  forecastCache.set(forecastCacheKey, forecastData);
  log('info', forecastCacheKey, 'fetched from WeatherAPI');
  res.json(forecastData);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/api/weather', async (req, res) => {
  const { city } = req.query;
  if (!city || typeof city !== 'string')
    return res.status(400).json({ error: 'city is required' });
  try {
    const forecastCacheKey = `weather:city:${city.toLowerCase().trim()}`;
    const url = `${BASE}/forecast.json?key=${KEY}&q=${encodeURIComponent(city)}&days=5&aqi=yes&alerts=no`;
    await fetchWeatherApi(url, forecastCacheKey, res);
  } catch (err) {
    log('error', '/api/weather', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/weather-coords', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });
  try {
    const forecastCacheKey = `weather:coords:${parseFloat(lat).toFixed(2)},${parseFloat(lon).toFixed(2)}`;
    const url = `${BASE}/forecast.json?key=${KEY}&q=${lat},${lon}&days=5&aqi=yes&alerts=no`;
    await fetchWeatherApi(url, forecastCacheKey, res);
  } catch (err) {
    log('error', '/api/weather-coords', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string' || q.trim().length < 2)
    return res.status(400).json({ error: 'q must be at least 2 characters' });
  try {
    const upstream = await fetch(`${BASE}/search.json?key=${KEY}&q=${encodeURIComponent(q)}`);
    const forecastData = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json(forecastData);
    res.json(forecastData);
  } catch (err) {
    log('error', '/api/search', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static frontend + SPA fallback
app.use(express.static(path.join(__dirname)));
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  log('info', 'server', `Dev server running at http://localhost:${PORT}`);
});
