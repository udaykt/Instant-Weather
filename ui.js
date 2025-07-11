// ui.js
// Handles all DOM/UI updates

import { dateBuilder } from './utils.js';

export function displayResults(weather, tempState) {
  console.log(weather);
  let city = document.querySelector('.location .city');
  let country = document.querySelector('.location .country');
  city.innerHTML = `${weather.location.name}`;
  country.innerHTML = `${weather.location.country}`;

  // ... (rest of your displayResults logic, including time-of-day switch)

  // Update temperature values in shared state
  const temperature = document.querySelector('.temperature-reading');
  const hi_low = document.querySelector('.temperature-real-feel');

  temperature.innerHTML = `${Math.round(weather.current.temp_c)}°`;
  tempState.temp_c = Math.round(weather.current.temp_c);
  tempState.temp_f = Math.round(weather.current.temp_f);
  hi_low.innerHTML = `Feels like ${Math.round(weather.current.feelslike_c)}°C`;
  tempState.hi_low_c = Math.round(weather.current.feelslike_c);
  tempState.hi_low_f = Math.round(weather.current.feelslike_f);
}

export function getMetric(m, tempState) {
  const metric = document.querySelector('.temperature-degree');
  const temperature = document.querySelector('.temperature-reading');
  const hi_low = document.querySelector('.temperature-real-feel');
  if (m === 'C') {
    metric.value = 'F';
    metric.innerHTML = 'F';
    temperature.textContent = `${tempState.temp_f}°`;
    hi_low.textContent = `Feels like ${tempState.hi_low_f}°F`;
  } else {
    metric.value = 'C';
    metric.innerHTML = 'C';
    temperature.textContent = `${tempState.temp_c}°`;
    hi_low.textContent = `Feels like ${tempState.hi_low_c}°C`;
  }
}

export function updateTimeOfDayUI(timeOfDay) {
  document.getElementById('main-block').style = timeOfDay.value;
  document.querySelector('.part-of-day').textContent = timeOfDay.name;
}
