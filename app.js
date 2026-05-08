// app.js — application entry point

import { getResultsByCity, getResultsByCoords, searchCities } from './weatherApi.js';
import { displayResults, getMetric } from './ui.js';
import { debounce } from './utils.js';

// Shared temperature state (C and F values for the current city)
const tempState = { temp_c: 0, temp_f: 0, hi_low_c: 0, hi_low_f: 0 };

// DOM references
const searchBox    = document.getElementById('search-box');
const searchBtn    = document.querySelector('.search-button');
const suggestEl    = document.getElementById('search-suggestions');
const tempToggle   = document.querySelector('.temperature-degree');

// ─── PWA ────────────────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// ─── Weather fetch ───────────────────────────────────────────────────────────
async function fetchAndDisplay(promise) {
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

function showErrorToast(msg) {
  document.querySelector('.error-toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.textContent = msg;
  toast.setAttribute('role', 'alert');
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ─── Search ──────────────────────────────────────────────────────────────────
function triggerSearch() {
  const city = searchBox.value.trim();
  if (!city) return;
  hideSuggestions();
  fetchAndDisplay(getResultsByCity(city));
}

searchBtn.addEventListener('click', triggerSearch);

searchBox.addEventListener('keydown', e => {
  if (e.key === 'Enter')  { triggerSearch(); }
  if (e.key === 'Escape') { hideSuggestions(); }
  if (e.key === 'ArrowDown') {
    const first = suggestEl.querySelector('.search-suggestion-item');
    first?.focus();
    e.preventDefault();
  }
});

// ─── Temperature toggle ───────────────────────────────────────────────────────
tempToggle.addEventListener('click', function () {
  getMetric(this.value, tempState);
});

// ─── Autocomplete ─────────────────────────────────────────────────────────────
function hideSuggestions() {
  suggestEl.innerHTML = '';
  suggestEl.classList.remove('active');
}

function renderSuggestions(cities) {
  if (!cities.length) { hideSuggestions(); return; }

  suggestEl.innerHTML = cities.slice(0, 5).map((c, i) =>
    `<li class="search-suggestion-item"
         role="option"
         tabindex="0"
         data-index="${i}">${c.name}, ${c.region ? c.region + ', ' : ''}${c.country}</li>`
  ).join('');
  suggestEl.classList.add('active');

  suggestEl.querySelectorAll('.search-suggestion-item').forEach((item, i) => {
    item.addEventListener('click', () => selectSuggestion(cities[i].name));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter')     { selectSuggestion(cities[i].name); }
      if (e.key === 'ArrowDown') { item.nextElementSibling?.focus(); e.preventDefault(); }
      if (e.key === 'ArrowUp')   {
        const prev = item.previousElementSibling;
        if (prev) { prev.focus(); } else { searchBox.focus(); }
        e.preventDefault();
      }
      if (e.key === 'Escape')    { hideSuggestions(); searchBox.focus(); }
    });
  });
}

function selectSuggestion(cityName) {
  searchBox.value = cityName;
  hideSuggestions();
  fetchAndDisplay(getResultsByCity(cityName));
}

const debouncedAutocomplete = debounce(async query => {
  if (!query || query.length < 2) { hideSuggestions(); return; }
  const cities = await searchCities(query);
  renderSuggestions(cities);
}, 300);

searchBox.addEventListener('input', e => debouncedAutocomplete(e.target.value));

// Hide dropdown when clicking outside the search wrapper
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrapper')) hideSuggestions();
});

// ─── Geolocation init ─────────────────────────────────────────────────────────
function init() {
  if (!navigator.geolocation) {
    fetchAndDisplay(getResultsByCity('London'));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => fetchAndDisplay(getResultsByCoords(pos.coords.latitude, pos.coords.longitude)),
    ()  => fetchAndDisplay(getResultsByCity('London'))
  );
}

init();
