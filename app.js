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

// Show loading state immediately when the script loads
const loadingOverlay = document.getElementById('loading-overlay');
const mainBlock = document.getElementById('main-block');

// Function to hide loading overlay and show main content
function hideLoading() {
  loadingOverlay.classList.add('fade-out');
  mainBlock.style.opacity = '1';
  mainBlock.style.transition = 'opacity 0.5s ease-in';
  
  // Remove the loading overlay from DOM after animation completes
  setTimeout(() => {
    loadingOverlay.style.display = 'none';
  }, 500);
}

// Initialize the app
window.onload = function() {
  // Show loading state
  loadingOverlay.style.display = 'flex';
  
  // Start loading weather data
  currentLocation();
};

const searchbox = document.querySelector('.search-box');
searchbox.addEventListener('keypress', setQuery);

document.querySelector('.search-button').addEventListener('click', () => {
  getResultsByCity(searchbox.value).then(weather => {
    displayResults(weather, tempState, hideLoading);
  }).catch(showError);
});

document.querySelector('.temperature-degree').addEventListener('click', function() {
  getMetric(this.value, tempState);
});

function currentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, geoError);
  } else {
    // Fallback: use default city if geolocation is not available
    getResultsByCity('Hyderabad').then(weather => {
      displayResults(weather, tempState, hideLoading);
    }).catch(err => showError(err));
  }
}

function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  getResultsByCoords(lat, lon).then(weather => {
    displayResults(weather, tempState, hideLoading);
  }).catch(showError);
}

function geoError(error) {
  console.error('Geolocation error:', error);
  // Fallback to default city
  getResultsByCity('Hyderabad').then(weather => {
    displayResults(weather, tempState, hideLoading);
  }).catch(showError);
}

function setQuery(event) {
  if (event.keyCode === 13) {
    getResultsByCity(searchbox.value).then(weather => {
      displayResults(weather, tempState, hideLoading);
    }).catch(err => showError(err));
  }
}

function showError(err) {
  console.error('Weather fetch error:', err);
  hideLoading();
  const cityElem = document.querySelector('.location .city');
  const countryElem = document.querySelector('.location .country');
  const descElem = document.querySelector('.weather-description');
  if (cityElem) cityElem.textContent = 'City not found';
  if (countryElem) countryElem.textContent = '';
  if (descElem) descElem.textContent = 'Please try a different city name.';
}


