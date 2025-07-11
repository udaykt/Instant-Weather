// weatherApi.js
// Handles all weather API interactions

const api = {
  key: "Yzg4MmI3MmNlNmQ2NGVhOWE0ODEyMTAxMTIxMDcwMw==", // base64 encoded
  base: "https://api.weatherapi.com/v1/current.json?",
};

export function getResultsByCity(city) {
  let cityValue = city && city.trim() ? city : 'Hyderabad';
  return fetch(`${api.base}key=${atob(api.key)}&q=${cityValue}&aqi=yes`)
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    });
}

export function getResultsByCoords(lat, lon) {
  return fetch(`${api.base}key=${atob(api.key)}&q=${lat},${lon}&aqi=yes`)
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    });
}
