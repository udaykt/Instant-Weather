// main.ts — application entry point

import { getResultsByCity, getResultsByCoords, searchCities } from './weatherApi';
import { displayResults, getMetric } from './ui';
import { debounce } from './utils';
import type { TempState } from './types';

// Shared temperature state (C and F for the current city)
const tempState: TempState = { temp_c: 0, temp_f: 0, hi_low_c: 0, hi_low_f: 0 };

// DOM references
const searchBox  = document.getElementById('search-box')        as HTMLInputElement;
const searchBtn  = document.querySelector<HTMLButtonElement>('.search-button')!;
const suggestEl  = document.getElementById('search-suggestions') as HTMLUListElement;
const tempToggle = document.querySelector<HTMLButtonElement>('.temperature-degree')!;

// ─── PWA ─────────────────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────
async function fetchAndDisplay(promise: ReturnType<typeof getResultsByCity | typeof getResultsByCoords>): Promise<void> {
  searchBtn.disabled = true;
  try {
    const weather = await promise;
    displayResults(weather, tempState);
  } catch {
    showErrorToast('Could not fetch weather data. Please try again.');
  } finally {
    searchBtn.disabled = false;
  }
}

function showErrorToast(msg: string): void {
  document.querySelector('.error-toast')?.remove();
  const toast = document.createElement('div');
  toast.className  = 'error-toast';
  toast.textContent = msg;
  toast.setAttribute('role', 'alert');
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ─── Search ───────────────────────────────────────────────────────────────────
function triggerSearch(): void {
  const city = searchBox.value.trim();
  if (!city) return;
  hideSuggestions();
  void fetchAndDisplay(getResultsByCity(city));
}

searchBtn.addEventListener('click', triggerSearch);

searchBox.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter')     { triggerSearch(); }
  if (e.key === 'Escape')    { hideSuggestions(); }
  if (e.key === 'ArrowDown') {
    (suggestEl.querySelector('.search-suggestion-item') as HTMLElement | null)?.focus();
    e.preventDefault();
  }
});

// ─── Temperature toggle ───────────────────────────────────────────────────────
tempToggle.addEventListener('click', function (this: HTMLButtonElement) {
  getMetric(this.value, tempState);
});

// ─── Autocomplete ─────────────────────────────────────────────────────────────
function hideSuggestions(): void {
  suggestEl.innerHTML = '';
  suggestEl.classList.remove('active');
}

function renderSuggestions(cities: Awaited<ReturnType<typeof searchCities>>): void {
  if (!cities.length) { hideSuggestions(); return; }

  suggestEl.innerHTML = cities.slice(0, 5).map((c, i) =>
    `<li class="search-suggestion-item" role="option" tabindex="0" data-index="${i}">
       ${c.name}${c.region ? `, ${c.region}` : ''}, ${c.country}
     </li>`,
  ).join('');
  suggestEl.classList.add('active');

  suggestEl.querySelectorAll<HTMLLIElement>('.search-suggestion-item').forEach((item, i) => {
    item.addEventListener('click', () => selectSuggestion(cities[i].name));
    item.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter')     { selectSuggestion(cities[i].name); }
      if (e.key === 'ArrowDown') { (item.nextElementSibling as HTMLElement | null)?.focus(); e.preventDefault(); }
      if (e.key === 'ArrowUp')   {
        const prev = item.previousElementSibling as HTMLElement | null;
        prev ? prev.focus() : searchBox.focus();
        e.preventDefault();
      }
      if (e.key === 'Escape')    { hideSuggestions(); searchBox.focus(); }
    });
  });
}

function selectSuggestion(cityName: string): void {
  searchBox.value = cityName;
  hideSuggestions();
  void fetchAndDisplay(getResultsByCity(cityName));
}

const debouncedAutocomplete = debounce(async (query: string) => {
  if (!query || query.length < 2) { hideSuggestions(); return; }
  const cities = await searchCities(query);
  renderSuggestions(cities);
}, 300);

searchBox.addEventListener('input', (e: Event) => {
  debouncedAutocomplete((e.target as HTMLInputElement).value);
});

document.addEventListener('click', (e: MouseEvent) => {
  if (!(e.target as Element).closest('.search-wrapper')) hideSuggestions();
});

// ─── Geolocation init ─────────────────────────────────────────────────────────
function init(): void {
  if (!navigator.geolocation) {
    void fetchAndDisplay(getResultsByCity('London'));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos: GeolocationPosition) =>
      void fetchAndDisplay(getResultsByCoords(pos.coords.latitude, pos.coords.longitude)),
    () => void fetchAndDisplay(getResultsByCity('London')),
  );
}

init();
