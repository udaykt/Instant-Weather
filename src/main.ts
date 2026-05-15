// main.ts — application entry point

import { fetchForecastByCity, fetchForecastByCoords } from '@/features/weather/forecastService';
import { renderForecast, formatTemperature } from '@/features/weather/weatherRenderer';
import { initCitySearch } from '@/features/search/citySearch';
import { initQuickCities, trackRecentCity } from '@/features/cities/quickCities';
import { initGlassHover } from '@/glassHover';
import type { TemperatureState, WeatherResponse } from '@/shared/types/weatherTypes';

// Shared temperature state (C and F for the currently displayed city)
const currentConditions: TemperatureState = {
  temp_c: 0,
  temp_f: 0,
  feelslike_c: 0,
  feelslike_f: 0,
};

// DOM references
const citySearchInput = document.getElementById('search-box') as HTMLInputElement;
const searchBtn = document.querySelector<HTMLButtonElement>('.search-button')!;
const suggestionDropdown = document.getElementById('search-suggestions') as HTMLUListElement;
const tempToggle = document.querySelector<HTMLButtonElement>('.temperature-degree')!;
const locateBtn = document.getElementById('locate-btn') as HTMLButtonElement | null;
const quickCityList = document.getElementById('quick-city-list') as HTMLElement | null;

// ─── PWA ─────────────────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────
async function fetchAndDisplay(promise: Promise<WeatherResponse>): Promise<void> {
  searchBtn.disabled = true;
  try {
    const weatherData = await promise;
    renderForecast(weatherData, currentConditions);
    // Track the canonical city name returned by the API (handles typos/aliases)
    if (weatherData.location?.name) {
      trackRecentCity(weatherData.location.name);
    }
  } catch {
    showErrorToast('Could not fetch weather data. Please try again.');
  } finally {
    searchBtn.disabled = false;
  }
}

function showErrorToast(msg: string): void {
  document.querySelector('.error-toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.textContent = msg;
  toast.setAttribute('role', 'alert');
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ─── City search (autocomplete + suggestions) ─────────────────────────────────
const { hideSuggestions } = initCitySearch(
  citySearchInput,
  suggestionDropdown,
  (cityName) => void fetchAndDisplay(fetchForecastByCity(cityName)),
);

// ─── Search trigger ───────────────────────────────────────────────────────────
function triggerSearch(): void {
  const location = citySearchInput.value.trim();
  if (!location) return;
  hideSuggestions();
  void fetchAndDisplay(fetchForecastByCity(location));
}

searchBtn.addEventListener('click', triggerSearch);
citySearchInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') triggerSearch();
});

// ─── Temperature toggle ───────────────────────────────────────────────────────
tempToggle.addEventListener('click', function (this: HTMLButtonElement) {
  formatTemperature(this.value, currentConditions);
});

// ─── Locate me button ─────────────────────────────────────────────────────────
locateBtn?.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showErrorToast('Geolocation is not supported by your browser.');
    return;
  }
  locateBtn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    (pos: GeolocationPosition) => {
      locateBtn.disabled = false;
      void fetchAndDisplay(fetchForecastByCoords(pos.coords.latitude, pos.coords.longitude));
    },
    () => {
      locateBtn.disabled = false;
      showErrorToast('Location access denied.');
    },
  );
});

// ─── Quick cities sidebar ─────────────────────────────────────────────────────
if (quickCityList) {
  void initQuickCities(quickCityList, fetchForecastByCity, (city) => {
    citySearchInput.value = city;
    hideSuggestions();
    void fetchAndDisplay(fetchForecastByCity(city));
  });
}

// ─── Geolocation init ─────────────────────────────────────────────────────────
function init(): void {
  if (!navigator.geolocation) {
    void fetchAndDisplay(fetchForecastByCity('London'));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos: GeolocationPosition) =>
      void fetchAndDisplay(fetchForecastByCoords(pos.coords.latitude, pos.coords.longitude)),
    () => void fetchAndDisplay(fetchForecastByCity('London')),
  );
}

init();

// Glass hover — attach after all elements are in the DOM
initGlassHover();
