// server.cjs — local Express dev server (proxies WeatherAPI to hide the key)
require('dotenv').config();
const express = require('express');
const fetch   = require('node-fetch');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 5000;
const KEY  = process.env.WEATHER_API_KEY;
const BASE = 'https://api.weatherapi.com/v1';

app.use(cors());

// Current + 5-day forecast by city name
app.get('/api/weather', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'city is required' });
  try {
    const r = await fetch(`${BASE}/forecast.json?key=${KEY}&q=${encodeURIComponent(city)}&days=5&aqi=yes&alerts=no`);
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    res.json(data);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

// Current + 5-day forecast by coordinates
app.get('/api/weather-coords', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });
  try {
    const r = await fetch(`${BASE}/forecast.json?key=${KEY}&q=${lat},${lon}&days=5&aqi=yes&alerts=no`);
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    res.json(data);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

// City search / autocomplete
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.status(400).json({ error: 'q must be at least 2 characters' });
  try {
    const r = await fetch(`${BASE}/search.json?key=${KEY}&q=${encodeURIComponent(q)}`);
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    res.json(data);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

// Serve static frontend
app.use(express.static(path.join(__dirname)));

// SPA fallback (exclude /api routes)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
