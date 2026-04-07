// Test API key directly
import fetch from 'node-fetch';

const API_KEY = 'REDACTED_OWM_API_KEY';

async function testAPI() {
  console.log('Testing OpenWeatherMap API key:', API_KEY);
  
  // Test 1: Direct API call with coordinates
  console.log('\n1. Testing direct API call with coordinates...');
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=51.5074&lon=-0.1278&appid=${API_KEY}&units=metric`);
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  // Test 2: Geocoding API
  console.log('\n2. Testing Geocoding API...');
  try {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=London&limit=1&appid=${API_KEY}`);
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  // Test 3: Check API key format
  console.log('\n3. API Key Analysis:');
  console.log('Length:', API_KEY.length);
  console.log('Format:', /^[a-f0-9]{32}$/.test(API_KEY) ? 'Valid hex format' : 'Invalid format');
  console.log('Contains letters:', /[a-zA-Z]/.test(API_KEY));
  console.log('Contains numbers:', /[0-9]/.test(API_KEY));
}

testAPI();
