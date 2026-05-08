// ui.ts — typed DOM/UI updates

import type { WeatherResponse, TempState, AirQuality, ForecastDay } from './types';
import { dateBuilder, getTimeOfDay } from './utils';

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const AQI_LABELS = ['', 'Good', 'Moderate', 'Unhealthy (Sensitive)', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
const AQI_COLORS = ['', '#00c853', '#ffd600', '#ff6d00', '#d50000', '#6a1b9a', '#37474f'];
const AQI_TEXT   = ['', '#000',    '#000',    '#fff',    '#fff',    '#fff',    '#fff'   ];

// Typed querySelector — throws if element is missing so callers never need null-checks
function qs<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: "${selector}"`);
  return el;
}

export function displayResults(weather: WeatherResponse, tempState: TempState): void {
  if (!weather?.current) return;
  const { location, current, forecast } = weather;

  // Location
  qs<HTMLSpanElement>('.city').textContent    = location.name;
  qs<HTMLSpanElement>('.country').textContent = location.country;

  // Condition text + icon
  const { condition } = current;
  qs<HTMLDivElement>('.weather-description').textContent = condition.text;
  const iconEl = document.getElementById('icon') as HTMLImageElement;
  iconEl.src = `https:${condition.icon}`;
  iconEl.alt = condition.text;

  // Time-of-day gradient
  const [, timePart] = location.localtime.split(' ');
  const hour = Number(timePart.split(':')[0]);
  const partOfDay = getTimeOfDay(hour);
  const mainBlock = document.getElementById('main-block') as HTMLElement;
  mainBlock.style.backgroundImage = partOfDay.gradient;
  qs<HTMLDivElement>('.part-of-day').textContent = partOfDay.name;

  // Input theme — light or dark text based on background
  applyInputTheme(partOfDay.isLight);

  // Date + time
  const jsDate = new Date(location.localtime.replace(/-/g, '/'));
  qs<HTMLSpanElement>('.date').textContent = `${dateBuilder(jsDate)},`;
  qs<HTMLSpanElement>('.time').textContent = ` ${timePart}`;

  // Temperatures
  const temp_c      = Math.round(current.temp_c);
  const temp_f      = Math.round(current.temp_f);
  const feelslike_c = Math.round(current.feelslike_c);
  const feelslike_f = Math.round(current.feelslike_f);

  qs<HTMLDivElement>('.temperature-reading').textContent   = `${temp_c}°`;
  qs<HTMLDivElement>('.temperature-real-feel').textContent = `Feels like ${feelslike_c}°C`;
  Object.assign(tempState, { temp_c, temp_f, hi_low_c: feelslike_c, hi_low_f: feelslike_f });

  // Always reset unit toggle to C on new data
  const toggleBtn = qs<HTMLButtonElement>('.temperature-degree');
  toggleBtn.value       = 'C';
  toggleBtn.textContent = 'C';

  // Stats
  qs<HTMLDivElement>('.humidity-value').textContent = `${current.humidity}%`;
  qs<HTMLDivElement>('.wind-value').textContent     = `${current.wind_kph} kph`;
  qs<HTMLDivElement>('.pressure-value').textContent = `${current.pressure_mb} mb`;

  // AQI + forecast
  if (current.air_quality) displayAQI(current.air_quality);
  if (forecast?.forecastday) displayForecast(forecast.forecastday);

  removeSkeleton();
  mainBlock.setAttribute('aria-busy', 'false');
}

function displayAQI(aqi: AirQuality): void {
  const badge = document.getElementById('aqi-badge') as HTMLDivElement | null;
  if (!badge) return;
  const idx = aqi['us-epa-index'];
  if (!idx || idx < 1 || idx > 6) { badge.textContent = ''; return; }
  badge.textContent           = `AQI · ${AQI_LABELS[idx]}`;
  badge.style.backgroundColor = AQI_COLORS[idx];
  badge.style.color           = AQI_TEXT[idx];
}

function displayForecast(days: ForecastDay[]): void {
  const container = document.getElementById('forecast-cards');
  if (!container) return;
  container.innerHTML = days.map((day, i) => {
    const date    = new Date(`${day.date}T00:00:00`);
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

function applyInputTheme(isLight: boolean): void {
  const color = isLight ? '#222' : '#efefef';
  let styleEl = document.getElementById('dynamic-input-theme') as HTMLStyleElement | null;
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

function removeSkeleton(): void {
  document.querySelectorAll('.skeleton-text').forEach(el => el.classList.remove('skeleton-text'));
  document.querySelectorAll('.skeleton-card').forEach(el => el.classList.remove('skeleton-card'));
}

export function getMetric(unit: string, tempState: TempState): void {
  const toggle = qs<HTMLButtonElement>('.temperature-degree');
  const tempEl = qs<HTMLDivElement>('.temperature-reading');
  const feelEl = qs<HTMLDivElement>('.temperature-real-feel');
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
