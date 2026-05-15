// main.ts — application entry point

import { fetchForecastByCity, fetchForecastByCoords } from '@/features/weather/forecastService';
import {
  renderForecast,
  applyTempUnit,
  renderForecastCards,
  renderHourlyForecast,
  renderSparkline,
  getLastWeatherData,
} from '@/features/weather/weatherRenderer';
import { initCitySearch } from '@/features/search/citySearch';
import { initQuickCities, trackRecentCity } from '@/features/cities/quickCities';
import { initGlassHover } from '@/glassHover';
import { shareWeatherCard } from '@/features/share/shareCard';
import type { TemperatureState, WeatherResponse } from '@/shared/types/weatherTypes';

// Shared temperature state
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
const locateBtn = document.getElementById('locate-btn') as HTMLButtonElement | null;
const quickCityList = document.getElementById('quick-city-list') as HTMLElement | null;
const shareBtn = document.getElementById('share-btn') as HTMLButtonElement | null;

// ─── PWA ──────────────────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────
async function fetchAndDisplay(promise: Promise<WeatherResponse>): Promise<void> {
  searchBtn.disabled = true;
  try {
    const weatherData = await promise;
    renderForecast(weatherData, currentConditions);
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

// ─── City search ──────────────────────────────────────────────────────────────
const { hideSuggestions } = initCitySearch(
  citySearchInput,
  suggestionDropdown,
  (cityName) => void fetchAndDisplay(fetchForecastByCity(cityName)),
);

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

// ─── Temperature unit toggle (segmented °C | °F) ──────────────────────────────
// applyTempUnit re-renders every temperature on screen and persists the choice.
document.querySelectorAll<HTMLButtonElement>('.unit-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    applyTempUnit(btn.dataset.unit === 'F' ? 'F' : 'C');
  });
});

// ─── Forecast toggle (5-day / hourly) ────────────────────────────────────────
document.querySelectorAll<HTMLButtonElement>('.forecast-toggle-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document
      .querySelectorAll<HTMLButtonElement>('.forecast-toggle-btn')
      .forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const data = getLastWeatherData();
    if (!data?.forecast?.forecastday) return;

    if (btn.dataset.mode === 'hourly') {
      const todayHours = data.forecast.forecastday[0].hour ?? [];
      const [, timePart] = data.location.localtime.split(' ');
      const currentHour = Number(timePart.split(':')[0]);
      renderHourlyForecast(todayHours, currentHour);
    } else {
      renderForecastCards(data.forecast.forecastday);
    }
  });
});

// ─── AQI badge popover toggle ────────────────────────────────────────────────
const aqiBadge = document.getElementById('aqi-badge');
const aqiPopover = document.getElementById('aqi-popover');

if (aqiBadge && aqiPopover) {
  const togglePopover = (show: boolean) => {
    if (show) {
      aqiPopover.removeAttribute('hidden');
      aqiBadge.setAttribute('aria-expanded', 'true');
    } else {
      aqiPopover.setAttribute('hidden', '');
      aqiBadge.setAttribute('aria-expanded', 'false');
    }
  };

  aqiBadge.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !aqiPopover.hasAttribute('hidden');
    togglePopover(!isOpen);
  });

  aqiBadge.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const isOpen = !aqiPopover.hasAttribute('hidden');
      togglePopover(!isOpen);
    }
    if (e.key === 'Escape') togglePopover(false);
  });

  document.addEventListener('click', (e) => {
    if (!aqiBadge.contains(e.target as Node) && !aqiPopover.contains(e.target as Node)) {
      togglePopover(false);
    }
  });
}

// ─── Share button ─────────────────────────────────────────────────────────────
shareBtn?.addEventListener('click', () => {
  void shareWeatherCard();
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

// ─── Sparkline re-render on resize ───────────────────────────────────────────
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener(
    'resize',
    (() => {
      let t = 0;
      return () => {
        clearTimeout(t);
        t = window.setTimeout(() => {
          const data = getLastWeatherData();
          if (!data?.forecast?.forecastday?.[0]?.hour) return;
          const [, timePart] = data.location.localtime.split(' ');
          const h = Number(timePart.split(':')[0]);
          renderSparkline(data.forecast.forecastday[0].hour, h);
        }, 200);
      };
    })(),
  );
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
