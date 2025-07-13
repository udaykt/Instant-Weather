// weatherApi.js
// Handles all weather API interactions

// weatherApi.js
// Handles all weather API interactions via secure backend proxy

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const apiBase = isLocal ? "http://localhost:5000" : "";

export function getResultsByCity(city) {
  let cityValue = city && city.trim() ? city : 'Hyderabad';
  const url = `${apiBase}/api/weather?city=${encodeURIComponent(cityValue)}`;
  console.log('[getResultsByCity] Fetching:', url);
  return fetch(url)
    .then((response) => {
      console.log('[getResultsByCity] Response status:', response.status);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    }).catch((err) => {
      console.error('[getResultsByCity] Fetch error:', err);
      throw err;
    });
}

export function getResultsByCoords(lat, lon) {
  const url = `${apiBase}/api/weather-coords?lat=${lat}&lon=${lon}`;
  console.log('[getResultsByCoords] Fetching:', url);
  return fetch(url)
    .then((response) => {
      console.log('[getResultsByCoords] Response status:', response.status);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    }).catch((err) => {
      console.error('[getResultsByCoords] Fetch error:', err);
      throw err;
    });
}

