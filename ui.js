// ui.js
// Handles all DOM/UI updates

import { dateBuilder } from './utils.js';

export function displayResults(weather, tempState, hideLoading) {
  console.log('[displayResults] Incoming weather object:', weather);
  if (!weather || !weather.current) {
    console.error('[displayResults] Missing weather or weather.current:', weather);
    if (hideLoading && typeof hideLoading === 'function') {
      hideLoading();
    }
    return;
  }
  console.log(weather);
  let city = document.querySelector('.location .city');
  let country = document.querySelector('.location .country');
  let weatherDescElem = document.querySelector('.weather-description');
  if (!city) console.error('[displayResults] .city element not found');
  if (!country) console.error('[displayResults] .country element not found');
  if (!weatherDescElem) console.error('[displayResults] .weather-description element not found');
  city.textContent = weather.location.name;
  country.textContent = weather.location.country;
  if (weatherDescElem) {
    if (weather.current.condition && weather.current.condition.text) {
      weatherDescElem.textContent = weather.current.condition.text;
    } else {
      weatherDescElem.textContent = 'N/A';
      console.error('[displayResults] weather.current.condition.text missing:', weather.current.condition);
    }
  }

    // Time-of-day background and label logic
  const times_of_day = {
    early_morning: {
      name: "Early Morning",
      value: "background-image: linear-gradient(to bottom, #232526, #414345);",
    },
    dawn: {
      name: "Dawn",
      value: "background-image: linear-gradient(to bottom, #f7971e, #ffd200, #f7971e, #ffd200);",
    },
    morning: {
      name: "Morning",
      value: "background-image: linear-gradient(to bottom, #a1c4fd, #c2e9fb);",
    },
    late_morning: {
      name: "Late Morning",
      value: "background-image: linear-gradient(to bottom, #fceabb, #f8b500);",
    },
    afternoon: {
      name: "Afternoon",
      value: "background-image: linear-gradient(to bottom, #00c6fb, #005bea);",
    },
    late_afternoon: {
      name: "Late Afternoon",
      value: "background-image: linear-gradient(to bottom, #f7971e, #ffd200);",
    },
    early_evening: {
      name: "Early Evening",
      value: "background-image: linear-gradient(to bottom, #f857a6, #ff5858);",
    },
    evening: {
      name: "Evening",
      value: "background-image: linear-gradient(to bottom, #667db6, #0082c8, #0082c8, #667db6);",
    },
    dusk: {
      name: "Dusk",
      value: "background-image: linear-gradient(to bottom, #232526, #414345, #0f2027);",
    },
    night: {
      name: "Night",
      value: "background-image: linear-gradient(to bottom, #141e30, #243b55);",
    },
    midnight: {
      name: "Midnight",
      value: "background-image: linear-gradient(to bottom, #000428, #004e92);",
    },
    middle_of_the_night: {
      name: "Middle of the Night",
      value: "background-image: linear-gradient(to bottom, #000000, #434343);",
    },
    default: {
      name: "",
      value: "background-image: linear-gradient(to bottom, #83a4d4, #b6fbff);",
    },
  };


  let time = `${weather.location.localtime}`;
  let hour = Number(time.split(" ")[1].split(":")[0]);
  let partOfDay = times_of_day.default;
  if (hour >= 1 && hour <= 2) partOfDay = times_of_day.middle_of_the_night;
  else if (hour > 2 && hour <= 5) partOfDay = times_of_day.early_morning;
  else if (hour > 5 && hour <= 6) partOfDay = times_of_day.dawn;
  else if (hour > 6 && hour <= 9) partOfDay = times_of_day.morning;
  else if (hour > 9 && hour <= 12) partOfDay = times_of_day.late_morning;
  else if (hour > 12 && hour <= 16) partOfDay = times_of_day.afternoon;
  else if (hour > 16 && hour <= 17) partOfDay = times_of_day.late_afternoon;
  else if (hour > 17 && hour <= 18) partOfDay = times_of_day.early_evening;
  else if (hour > 18 && hour <= 19) partOfDay = times_of_day.dusk;
  else if (hour > 19 && hour <= 21) partOfDay = times_of_day.evening;
  else if (hour > 21) partOfDay = times_of_day.night;

  document.getElementById('main-block').style = partOfDay.value;
  document.querySelector('.part-of-day').textContent = partOfDay.name;

  // Dynamically set search box placeholder color for readability
  let placeholderColor = '#efefef'; // default light
  // Use dark placeholder for light backgrounds (morning, late_morning, afternoon)
  if ([times_of_day.morning, times_of_day.late_morning, times_of_day.afternoon].includes(partOfDay)) {
    placeholderColor = '#222';
  }
  // Remove previous dynamic placeholder style if any
  const prevStyle = document.getElementById('dynamic-placeholder-style');
  if (prevStyle) prevStyle.remove();
  const style = document.createElement('style');
  style.id = 'dynamic-placeholder-style';
  style.innerHTML = `.search-box::placeholder { color: ${placeholderColor} !important; }\n.search-box { color: ${placeholderColor} !important; }\n.search-button { color: ${placeholderColor} !important; }`;
  document.head.appendChild(style);

  // Also update the Go button text color directly for immediate effect
  const searchButton = document.querySelector('.search-button');
  if (searchButton) searchButton.style.color = placeholderColor;

  // Update date and time in UI
  const dateElem = document.querySelector('.date');
  const timeElem = document.querySelector('.time');
  if (dateElem && timeElem) {
    const localtime = weather.location.localtime; // e.g., "2025-07-11 21:30"
    const [datePart, timePart] = localtime.split(' ');
    const jsDate = new Date(localtime.replace(/-/g, '/'));
    dateElem.textContent = dateBuilder(jsDate);
    timeElem.textContent = timePart;
  }

  // Update temperature values in shared state
  const temperature = document.querySelector('.temperature-reading');
  const hi_low = document.querySelector('.temperature-real-feel');

  temperature.textContent = `${Math.round(weather.current.temp_c)}°`;
  tempState.temp_c = Math.round(weather.current.temp_c);
  tempState.temp_f = Math.round(weather.current.temp_f);
  hi_low.textContent = `Feels like ${Math.round(weather.current.feelslike_c)}°C`;
  tempState.hi_low_c = Math.round(weather.current.feelslike_c);
  tempState.hi_low_f = Math.round(weather.current.feelslike_f);

  // Update weather icon from API
  const iconElem = document.getElementById('icon');
  if (iconElem && weather.current.condition && weather.current.condition.icon) {
    iconElem.src = 'https:' + weather.current.condition.icon;
    iconElem.alt = weather.current.condition.text || 'Weather icon';
  }

  // Update humidity, wind, and pressure in summary
  const humidityElem = document.querySelector('.humidity-value');
  const windElem = document.querySelector('.wind-value');
  const pressureElem = document.querySelector('.pressure-value');
  if (humidityElem && weather.current.humidity !== undefined) humidityElem.textContent = weather.current.humidity + '%';
  if (windElem && weather.current.wind_kph !== undefined) windElem.textContent = weather.current.wind_kph + ' kph';
  if (pressureElem && weather.current.pressure_mb !== undefined) pressureElem.textContent = weather.current.pressure_mb + ' mb';

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
    metric.textContent = 'F';
    temperature.textContent = `${tempState.temp_f}°`;
    hi_low.textContent = `Feels like ${tempState.hi_low_f}°F`;
  } else {
    metric.value = 'C';
    metric.textContent = 'C';
    temperature.textContent = `${tempState.temp_c}°`;
    hi_low.textContent = `Feels like ${tempState.hi_low_c}°C`;
  }
}

export function updateTimeOfDayUI(timeOfDay) {
  document.getElementById('main-block').style = timeOfDay.value;
  document.querySelector('.part-of-day').textContent = timeOfDay.name;
}
