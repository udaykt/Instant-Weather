// server.js - Node.js/Express backend proxy for secure WeatherAPI access
import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5/weather?';

app.use(cors());

// Proxy endpoint: /api/weather?city=CityName
app.get('/api/weather', async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }
  try {
    // First, get coordinates from city name using Geocoding API
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${WEATHER_API_KEY}`;
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) {
      return res.status(geoResponse.status).json({ error: 'Geocoding API error' });
    }
    const geoData = await geoResponse.json();
    
    if (!geoData || geoData.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    const { lat, lon } = geoData[0];
    
    // Then get weather using coordinates
    const weatherUrl = `${WEATHER_API_BASE}lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      return res.status(weatherResponse.status).json({ error: 'Weather API error' });
    }
    const weatherData = await weatherResponse.json();
    res.json(weatherData);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Proxy by coordinates (slash version)
app.get('/api/weather/coords', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }
  try {
    const url = `${WEATHER_API_BASE}lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
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

// Proxy by coordinates (dash version)
app.get('/api/weather-coords', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }
  try {
    const url = `${WEATHER_API_BASE}lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
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

// Serve static files from the current directory
app.use(express.static('.'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Weather API proxy ready`);
});
