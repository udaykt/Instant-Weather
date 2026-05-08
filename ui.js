// ui.js — all DOM/UI updates

import { dateBuilder, getTimeOfDay } from './utils.js';

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AQI_LABELS = ['', 'Good', 'Moderate', 'Unhealthy (Sensitive)', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
const AQI_COLORS = ['', '#00c853', '#ffd600', '#ff6d00', '#d50000', '#6a1b9a', '#37474f'];
const AQI_TEXT   = ['', '#000',    '#000',    '#fff',    '#fff',    '#fff',    '#fff'   ];

export function displayResults(weather, tempState) {
  if (!weather?.current) return;

  const { location, current, forecast } = weather;

  // Location
  qs('.city').textContent    = location.name;
  qs('.country').textContent = location.country;

  // Weather description + icon
  const condition = current.condition;
  qs('.weather-description').textContent = condition?.text ?? 'N/A';
  const iconEl = document.getElementById('icon');
  iconEl.src = `https:${condition.icon}`;
  iconEl.alt = condition.text;

  // Time-of-day gradient
  const [, timePart] = location.localtime.split(' ');
  const hour = Number(timePart.split(':')[0]);
  const partOfDay = getTimeOfDay(hour);
  const mainBlock = document.getElementById('main-block');
  mainBlock.style.backgroundImage = partOfDay.gradient;
  qs('.part-of-day').textContent = partOfDay.name;

  // Adaptive input colour for light-background times
  applyInputTheme(partOfDay.isLight);

  // Date + time
  const jsDate = new Date(location.localtime.replace(/-/g, '/'));
  qs('.date').textContent = dateBuilder(jsDate) + ',';
  qs('.time').textContent = ' ' + timePart;

  // Temperatures
  const temp_c      = Math.round(current.temp_c);
  const temp_f      = Math.round(current.temp_f);
  const feelslike_c = Math.round(current.feelslike_c);
  const feelslike_f = Math.round(current.feelslike_f);

  qs('.temperature-reading').textContent    = `${temp_c}°`;
  qs('.temperature-real-feel').textContent  = `Feels like ${feelslike_c}°C`;

  Object.assign(tempState, { temp_c, temp_f, hi_low_c: feelslike_c, hi_low_f: feelslike_f });

  // Reset unit toggle to C whenever new data loads
  const toggleBtn = qs('.temperature-degree');
  toggleBtn.value       = 'C';
  toggleBtn.textContent = 'C';

  // Stats
  qs('.humidity-value').textContent = `${current.humidity}%`;
  qs('.wind-value').textContent     = `${current.wind_kph} kph`;
  qs('.pressure-value').textContent = `${current.pressure_mb} mb`;

  // AQI badge
  displayAQI(current.air_quality);

  // 5-day forecast
  if (forecast?.forecastday) displayForecast(forecast.forecastday);

  // Remove skeleton shimmer
  removeSkeleton();
  mainBlock.setAttribute('aria-busy', 'false');
}

function displayAQI(aqi) {
  const badge = document.getElementById('aqi-badge');
  if (!badge) return;
  const idx = aqi?.['us-epa-index'];
  if (!idx || idx < 1 || idx > 6) { badge.textContent = ''; return; }
  badge.textContent            = `AQI • ${AQI_LABELS[idx]}`;
  badge.style.backgroundColor  = AQI_COLORS[idx];
  badge.style.color            = AQI_TEXT[idx];
}

function displayForecast(days) {
  const container = document.getElementById('forecast-cards');
  if (!container) return;

  container.innerHTML = days.map((day, i) => {
    const date    = new Date(day.date + 'T00:00:00');
    const label   = i === 0 ? 'Today' : SHORT_DAYS[date.getDay()];
    const iconUrl = `https:${day.day.condition.icon}`;
    const high    = Math.round(day.day.maxtemp_c);
    const low     = Math.round(day.day.mintemp_c);
    const desc    = day.day.condition.text;
    return `
      <div class="forecast-card" role="listitem" aria-label="${label}: ${desc}, High ${high}° Low ${low}°">
        <div class="forecast-day">${label}</div>
        <img class="forecast-icon" src="${iconUrl}" alt="${desc}" loading="lazy" />
        <div class="forecast-temps">
          <span class="forecast-high">${high}°</span>
          <span class="forecast-low">${low}°</span>
        </div>
        <div class="forecast-desc">${desc}</div>
      </div>`;
  }).join('');
}

function applyInputTheme(isLight) {
  const color = isLight ? '#222' : '#efefef';
  let styleEl = document.getElementById('dynamic-input-theme');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-input-theme';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    .search-box::placeholder { color: ${color} !important; }
    .search-box              { color: ${color} !important; }
    .search-button           { color: ${color} !important; }
  `;
}

function removeSkeleton() {
  document.querySelectorAll('.skeleton-text').forEach(el => el.classList.remove('skeleton-text'));
  document.querySelectorAll('.skeleton-card').forEach(el => el.classList.remove('skeleton-card'));
}

export function getMetric(unit, tempState) {
  const toggle = qs('.temperature-degree');
  const tempEl = qs('.temperature-reading');
  const feelEl = qs('.temperature-real-feel');
  if (unit === 'C') {
    toggle.value       = 'F';
    toggle.textContent = 'F';
    tempEl.textContent = `${tempState.temp_f}°`;
    feelEl.textContent = `Feels like ${tempState.hi_low_f}°F`;
  } else {
    toggle.value       = 'C';
    toggle.textContent = 'C';
    tempEl.textContent = `${tempState.temp_c}°`;
    feelEl.textContent = `Feels like ${tempState.hi_low_c}°C`;
  }
}

function qs(selector) {
  return document.querySelector(selector);
}
