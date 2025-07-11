// server.js - Node.js/Express backend proxy for secure WeatherAPI access
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1/current.json?';

app.use(cors());

// Proxy endpoint: /api/weather?city=CityName
app.get('/api/weather', async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }
  try {
    const url = `${WEATHER_API_BASE}key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&aqi=yes`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Weather API error' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Optionally: Proxy by coordinates
app.get('/api/weather/coords', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }
  try {
    const url = `${WEATHER_API_BASE}key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=yes`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Weather API error' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static frontend files from the project root
const path = require('path');
app.use(express.static(path.join(__dirname)));

// SPA support: serve index.html for all unknown routes (except API)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Weather proxy server and static frontend running on port ${PORT}`);
});
