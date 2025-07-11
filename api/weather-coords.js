// Vercel Serverless Function: /api/weather-coords
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
  const WEATHER_API_BASE = 'https://api.weatherapi.com/v1/current.json?';
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
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
