// weatherApi.js
// Handles all weather API interactions

// weatherApi.js
// Handles all weather API interactions via secure backend proxy

export function getResultsByCity(city) {
  let cityValue = city && city.trim() ? city : 'Hyderabad';
  return fetch(`/api/weather?city=${encodeURIComponent(cityValue)}`)
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    });
}

export function getResultsByCoords(lat, lon) {
  return fetch(`/api/weather-coords?lat=${lat}&lon=${lon}`)
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    });
}

