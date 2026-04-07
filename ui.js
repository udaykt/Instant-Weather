// ui.js
// Handles all DOM/UI updates

import { dateBuilder } from './utils.js';
import { updateWeatherIcon } from './weatherIcons.js';

// Time-based background themes
const TIMES_OF_DAY = {
  early_morning: {
    name: "Early Morning",
    value: "linear-gradient(to bottom, #232526, #414345)",
  },
  dawn: {
    name: "Dawn",
    value: "linear-gradient(to bottom, #f7971e, #ffd200, #f7971e, #ffd200)",
  },
  morning: {
    name: "Morning",
    value: "linear-gradient(to bottom, #a1c4fd, #c2e9fb)",
  },
  late_morning: {
    name: "Late Morning",
    value: "linear-gradient(to bottom, #fceabb, #f8b500)",
  },
  afternoon: {
    name: "Afternoon",
    value: "linear-gradient(to bottom, #00c6fb, #005bea)",
  },
  late_afternoon: {
    name: "Late Afternoon",
    value: "linear-gradient(to bottom, #f7971e, #ffd200)",
  },
  early_evening: {
    name: "Early Evening",
    value: "linear-gradient(to bottom, #f857a6, #ff5858)",
  },
  evening: {
    name: "Evening",
    value: "linear-gradient(to bottom, #667db6, #0082c8, #0082c8, #667db6)",
  },
  dusk: {
    name: "Dusk",
    value: "linear-gradient(to bottom, #ff6b6b, #4ecdc4, #45b7d1)",
  },
  night: {
    name: "Night",
    value: "linear-gradient(to bottom, #141e30, #243b55)",
  },
  midnight: {
    name: "Midnight",
    value: "linear-gradient(to bottom, #000428, #004e92)",
  },
  middle_of_the_night: {
    name: "Middle of the Night",
    value: "linear-gradient(to bottom, #000000, #434343)",
  },
  default: {
    name: "",
    value: "linear-gradient(to bottom, #83a4d4, #b6fbff)",
  },
};

// Apply background based on city's local time, not user's local time
function applyTimeBasedBackground(weatherData = null) {
  // Use city's local time if available, otherwise use user's time
  let now;
  let cityName = 'Local';
  
  if (weatherData && weatherData.timezone) {
    // Calculate city's local time using timezone offset
    const userLocalTime = new Date();
    const utcTime = userLocalTime.getTime() + (userLocalTime.getTimezoneOffset() * 60000);
    now = new Date(utcTime + (weatherData.timezone * 1000));
    cityName = weatherData.name || 'Unknown';
    
    console.log(`[Background] City: ${cityName}`);
    console.log(`[Background] User local time: ${userLocalTime.toLocaleTimeString()}`);
    console.log(`[Background] Timezone offset: ${weatherData.timezone}s (${weatherData.timezone/3600}h)`);
    console.log(`[Background] City local time: ${now.toLocaleTimeString()}`);
    console.log(`[Background] City hour: ${now.getHours()}`);
  } else {
    // Fallback to user's local time
    now = new Date();
    console.log(`[Background] No timezone data, using user local time: ${now.toLocaleTimeString()} (hour: ${now.getHours()})`);
  }
  
  const hour = now.getHours();
  let partOfDay = TIMES_OF_DAY.default;
  
  // Determine time period
  if (hour >= 1 && hour <= 2) partOfDay = TIMES_OF_DAY.middle_of_the_night;
  else if (hour > 2 && hour <= 5) partOfDay = TIMES_OF_DAY.early_morning;
  else if (hour > 5 && hour <= 6) partOfDay = TIMES_OF_DAY.dawn;
  else if (hour > 6 && hour <= 9) partOfDay = TIMES_OF_DAY.morning;
  else if (hour > 9 && hour <= 12) partOfDay = TIMES_OF_DAY.late_morning;
  else if (hour > 12 && hour <= 16) partOfDay = TIMES_OF_DAY.afternoon;
  else if (hour > 16 && hour <= 17) partOfDay = TIMES_OF_DAY.late_afternoon;
  else if (hour > 17 && hour <= 18) partOfDay = TIMES_OF_DAY.early_evening;
  else if (hour > 18 && hour <= 19) partOfDay = TIMES_OF_DAY.dusk;
  else if (hour > 19 && hour <= 21) partOfDay = TIMES_OF_DAY.evening;
  else if (hour > 21) partOfDay = TIMES_OF_DAY.night;

  // Always update DOM for different cities, remove caching for now
  const backgroundStyle = `${partOfDay.value} !important`;
  document.body.style.background = backgroundStyle;
  document.documentElement.style.background = backgroundStyle;
  
  // Update part-of-day text
  const partOfDayElement = document.querySelector('.part-of-day');
  if (partOfDayElement) {
    partOfDayElement.textContent = partOfDay.name;
  }
  
  console.log(`[Background] ${cityName}: ${partOfDay.name} (${hour}:00) - ${partOfDay.value}`);
}

// Apply background immediately when script loads
if (typeof document !== 'undefined') {
  // Apply initial background with user's timezone
  applyTimeBasedBackground();
}

// Store current weather data for auto-updates
let currentWeatherData = null;

export function displayResults(weather, tempState, hideLoading) {
  console.log('[displayResults] Full weather object:', weather);
  console.log('[displayResults] Weather timezone:', weather.timezone);
  console.log('[displayResults] Weather name:', weather.name);
  
  if (!weather || !weather.main) {
    console.error('[displayResults] Missing weather or weather.main:', weather);
    return;
  }
  
  // Store current weather data for auto-updates
  currentWeatherData = weather;
  
  // Update background based on weather data timezone
  applyTimeBasedBackground(weather);
  let city = document.querySelector('.location .city');
  let country = document.querySelector('.location .country');
  let weatherDescElem = document.querySelector('.weather-description');
  if (!city) console.error('[displayResults] .city element not found');
  if (!country) console.error('[displayResults] .country element not found');
  if (!weatherDescElem) console.error('[displayResults] .weather-description element not found');
  city.innerHTML = `${weather.name}`;
  country.innerHTML = `${weather.sys.country}`;
  if (weatherDescElem) {
    if (weather.weather && weather.weather[0] && weather.weather[0].description) {
      weatherDescElem.innerHTML = weather.weather[0].description;
    } else {
      weatherDescElem.innerHTML = 'N/A';
      console.error('[displayResults] weather.weather[0].description missing:', weather.weather);
    }
  }

  // Update weather icon
  if (weather.weather && weather.weather[0] && weather.weather[0].icon) {
    updateWeatherIcon(weather.weather[0].icon);
  }

  // Update date and time in UI
  const dateElem = document.querySelector('.date');
  const timeElem = document.querySelector('.time');
  if (dateElem && timeElem) {
    const now = new Date();
    dateElem.textContent = dateBuilder(now);
    timeElem.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  // Update temperature values in shared state
  const temperature = document.querySelector('.temperature-reading');
  const hi_low = document.querySelector('.temperature-real-feel');

  temperature.innerHTML = `${Math.round(weather.main.temp)}°`;
  tempState.temp_c = Math.round(weather.main.temp);
  tempState.temp_f = Math.round(weather.main.temp * 9/5 + 32);
  hi_low.innerHTML = `Feels like ${Math.round(weather.main.feels_like)}°C`;
  tempState.hi_low_c = Math.round(weather.main.feels_like);
  tempState.hi_low_f = Math.round(weather.main.feels_like * 9/5 + 32);

  // Update humidity, wind, and pressure in summary
  const humidityElem = document.querySelector('.humidity-value');
  const windElem = document.querySelector('.wind-value');
  const pressureElem = document.querySelector('.pressure-value');
  if (humidityElem && weather.main.humidity !== undefined) humidityElem.textContent = weather.main.humidity + '%';
  if (windElem && weather.wind.speed !== undefined) windElem.textContent = Math.round(weather.wind.speed * 3.6) + ' kph';
  if (pressureElem && weather.main.pressure !== undefined) pressureElem.textContent = weather.main.pressure + ' mb';

  // Hide loading overlay after all UI updates are complete
  if (hideLoading && typeof hideLoading === 'function') {
    requestAnimationFrame(() => {
      hideLoading();
    });
  }
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

// Auto-update background every minute to handle time transitions
if (typeof document !== 'undefined') {
  setInterval(() => {
    applyTimeBasedBackground(currentWeatherData);
  }, 60000);
}

