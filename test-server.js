// Test server endpoint
import fetch from 'node-fetch';

async function testServer() {
  console.log('Testing server endpoint...');
  
  try {
    const response = await fetch('http://localhost:5000/api/weather?city=London');
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testServer();
