// Debug full flow from frontend to backend
import fetch from 'node-fetch';

async function debugFullFlow() {
  console.log('=== DEBUGGING FULL FLOW ===\n');
  
  // 1. Test direct API calls (we know these work)
  console.log('1. Direct API calls (baseline):');
  try {
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=51.5074&lon=-0.1278&appid=REDACTED_OWM_API_KEY&units=metric`);
    console.log('   Direct weather API:', weatherResponse.status);
  } catch (e) {
    console.log('   Direct weather API error:', e.message);
  }
  
  try {
    const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=London&limit=1&appid=REDACTED_OWM_API_KEY`);
    console.log('   Direct geocoding API:', geoResponse.status);
  } catch (e) {
    console.log('   Direct geocoding API error:', e.message);
  }
  
  // 2. Test server endpoints
  console.log('\n2. Server endpoints:');
  try {
    const cityResponse = await fetch('http://localhost:5000/api/weather?city=London');
    console.log('   Server city endpoint:', cityResponse.status);
    const cityData = await cityResponse.json();
    console.log('   Server city response keys:', Object.keys(cityData));
  } catch (e) {
    console.log('   Server city endpoint error:', e.message);
  }
  
  try {
    const coordsResponse = await fetch('http://localhost:5000/api/weather-coords?lat=51.5074&lon=-0.1278');
    console.log('   Server coords endpoint:', coordsResponse.status);
    const coordsData = await coordsResponse.json();
    console.log('   Server coords response keys:', Object.keys(coordsData));
  } catch (e) {
    console.log('   Server coords endpoint error:', e.message);
  }
  
  // 3. Test frontend URL construction
  console.log('\n3. Frontend URL construction:');
  const isLocal = true; // Simulating browser environment
  const apiBase = isLocal ? "http://localhost:5000" : "";
  const cityValue = 'London';
  const frontendUrl = `${apiBase}/api/weather?city=${encodeURIComponent(cityValue)}`;
  console.log('   Frontend URL:', frontendUrl);
  
  try {
    const frontendResponse = await fetch(frontendUrl);
    console.log('   Frontend URL test:', frontendResponse.status);
    const frontendData = await frontendResponse.json();
    console.log('   Frontend response structure:', {
      hasMain: !!frontendData.main,
      hasWeather: !!frontendData.weather,
      hasName: !!frontendData.name,
      hasSys: !!frontendData.sys,
      mainKeys: frontendData.main ? Object.keys(frontendData.main) : [],
      weatherKeys: frontendData.weather ? Object.keys(frontendData.weather[0] || {}) : []
    });
  } catch (e) {
    console.log('   Frontend URL error:', e.message);
  }
  
  console.log('\n=== DEBUG COMPLETE ===');
}

debugFullFlow();
