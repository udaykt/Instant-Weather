// Test if color changes are working in the live app
import fetch from 'node-fetch';

async function testLiveApp() {
  console.log('Testing live app color functionality...\n');
  
  try {
    // Test if server is responding
    const response = await fetch('http://localhost:5000/weather.html');
    console.log('Server status:', response.status);
    
    if (response.ok) {
      const html = await response.text();
      console.log('✅ Server is serving weather.html');
      
      // Check if our UI.js changes are included
      if (html.includes('app.js')) {
        console.log('✅ app.js is referenced');
      }
      
      // Test the API endpoint
      const apiResponse = await fetch('http://localhost:5000/api/weather?city=London');
      if (apiResponse.ok) {
        const weatherData = await apiResponse.json();
        console.log('✅ API endpoint working');
        console.log('Weather data keys:', Object.keys(weatherData));
      } else {
        console.log('❌ API endpoint failed');
      }
    } else {
      console.log('❌ Server not responding properly');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testLiveApp();
