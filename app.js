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

window.onload = currentLocation;

const searchbox = document.querySelector('.search-box');
searchbox.addEventListener('keypress', setQuery);

document.querySelector('.search-button').addEventListener('click', () => {
  getResultsByCity(searchbox.value).then(weather => {
    displayResults(weather, tempState);
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
    getResultsByCity('Hyderabad').then(displayResults).catch(showError);
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
    getResultsByCity(searchbox.value).then(weather => {
      displayResults(weather, tempState);
    }).catch(showError);
  }
}

function showError(err) {
  // Optionally show error to user in the UI
  alert('Could not fetch weather data. Please try again later.');
  console.error('Weather fetch error:', err);
}

const times_of_day = {
  early_morning: {
    name: "Early Morning",
    value: "background-image: linear-gradient(to bottom, #D38312, #A83279);",
  },
  dawn: {
    name: "Dawn",
    value: "background-image: linear-gradient(to bottom, #ff4b1f, #1fddff);",
  },
  morning: {
    name: "Morning",
    value: "background-image: linear-gradient(to bottom, #E5E5BE, #003973);",
  },
  late_morning: {
    name: "Late Morning",
    value: "background-image: linear-gradient(to bottom, #00d2ff, #928DAB);",
  },
  afternoon: {
    name: "Afternoon",
    value: "background-image: linear-gradient(to bottom, #c0c0aa, #1cefff);",
  },
  late_afternoon: {
    name: "Late Afternoon",
    value: "background-image: linear-gradient(to bottom, #2196f3, #f44336);",
  },
  early_evening: {
    name: "Early Evening",
    value:
      "background-image: linear-gradient(to bottom, #833ab4, #fd1d1d, #fcb045);",
  },
  evening: {
    name: "Evening",
    value: "background-image: linear-gradient(to bottom, #434343, #000000);",
  },
  dusk: {
    name: "Dusk",
    value: "background-image: linear-gradient(to bottom, #BA8B02, #181818);",
  },
  night: {
    name: "Night",
    value: "background-image: linear-gradient(to bottom, #9a8478, #1e130c);",
  },
  midnight: {
    name: "Midnight",
    value: "background-image: linear-gradient(to bottom, #414345, #232526);",
  },
  middle_of_the_night: {
    name: "Middle of the Night",
    value: "background-image: linear-gradient(to bottom, #190A05, #870000);",
  },
  default: {
    name: "",
    value: "background-image: linear-gradient(to bottom, #4286f4, #373B44);",
  },
};

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
