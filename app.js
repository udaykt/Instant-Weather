// app.js (refactored as ES module)
import { getResultsByCity, getResultsByCoords } from './weatherApi.js';
import { displayResults, getMetric } from './ui.js';

// Shared state for temperature values
const tempState = {
  temp_c: 36,
  temp_f: 97,
  hi_low_c: 27,
  hi_low_f: 88
};

// Initialize the app
if (typeof window !== 'undefined') {
  window.onload = function() {
    // Start loading weather data immediately
    currentLocation();
  };
}

if (typeof document !== 'undefined') {
    const searchbox = document.querySelector('.search-box');
    const searchButton = document.querySelector('.search-button');
    
    if (searchbox) {
        searchbox.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                getResultsByCity(searchbox.value).then(weather => {
                    displayResults(weather, tempState);
                }).catch(showError);
            }
        });
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            if (searchbox) {
                getResultsByCity(searchbox.value).then(weather => {
                    displayResults(weather, tempState);
                }).catch(showError);
            }
        });
    }
}

if (typeof document !== 'undefined') {
    const tempDegree = document.querySelector('.temperature-degree');
    if (tempDegree) {
        tempDegree.addEventListener('click', function() {
            getMetric(this.value, tempState);
        });
    }
}

function currentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, geoError);
  } else {
    // Fallback: use default city if geolocation is not available
    getResultsByCity('Hyderabad').then(weather => {
        displayResults(weather, tempState);
    }).catch(showError);
  }
}

function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  getResultsByCoords(lat, lon).then(weather => {
    displayResults(weather, tempState);
  }).catch(showError);
}

function geoError(error) {
  console.error('Geolocation error:', error);
  // Fallback to default city
  getResultsByCity('Hyderabad').then(weather => {
    displayResults(weather, tempState);
  }).catch(showError);
}

function setQuery(event) {
  if (event.keyCode === 13) {
    const searchbox = document.querySelector('.search-box');
    if (searchbox) {
      getResultsByCity(searchbox.value).then(weather => {
        displayResults(weather, tempState);
      }).catch(showError);
    }
  }
}

function showError(err) {
    const errorMessage = document.createElement('div');
    errorMessage.textContent = 'Could not fetch weather data. Please try again later.';
    errorMessage.classList.add('error-message');
    document.body.appendChild(errorMessage);
    console.error('Weather fetch error:', err);
}

