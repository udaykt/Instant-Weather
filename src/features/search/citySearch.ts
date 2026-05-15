// citySearch.ts — city autocomplete wiring

import { fetchCitySuggestions } from '@/features/weather/forecastService';
import { debounce } from '@/shared/utils/weatherUtils';
import type { CityResult } from '@/shared/types/weatherTypes';

export function initCitySearch(
  citySearchInput: HTMLInputElement,
  suggestionDropdown: HTMLUListElement,
  onSelectCity: (cityName: string) => void,
): { hideSuggestions: () => void } {
  function hideSuggestions(): void {
    suggestionDropdown.innerHTML = '';
    suggestionDropdown.classList.remove('active');
  }

  function selectSuggestion(cityName: string): void {
    citySearchInput.value = cityName;
    hideSuggestions();
    onSelectCity(cityName);
  }

  function renderSuggestions(cities: CityResult[]): void {
    if (!cities.length) {
      hideSuggestions();
      return;
    }

    suggestionDropdown.innerHTML = cities
      .slice(0, 5)
      .map(
        (c, i) =>
          `<li class="search-suggestion-item" role="option" tabindex="0" data-index="${i}">
           ${c.name}${c.region ? `, ${c.region}` : ''}, ${c.country}
         </li>`,
      )
      .join('');
    suggestionDropdown.classList.add('active');

    suggestionDropdown
      .querySelectorAll<HTMLLIElement>('.search-suggestion-item')
      .forEach((item, i) => {
        item.addEventListener('click', () => selectSuggestion(cities[i].name));
        item.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            selectSuggestion(cities[i].name);
          }
          if (e.key === 'ArrowDown') {
            (item.nextElementSibling as HTMLElement | null)?.focus();
            e.preventDefault();
          }
          if (e.key === 'ArrowUp') {
            const prev = item.previousElementSibling as HTMLElement | null;
            (prev ?? citySearchInput).focus();
            e.preventDefault();
          }
          if (e.key === 'Escape') {
            hideSuggestions();
            citySearchInput.focus();
          }
        });
      });
  }

  const debouncedAutocomplete = debounce(async (query: string) => {
    if (!query || query.length < 2) {
      hideSuggestions();
      return;
    }
    const cities = await fetchCitySuggestions(query);
    renderSuggestions(cities);
  }, 300);

  citySearchInput.addEventListener('input', (e: Event) => {
    debouncedAutocomplete((e.target as HTMLInputElement).value);
  });

  citySearchInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') hideSuggestions();
    if (e.key === 'ArrowDown') {
      (suggestionDropdown.querySelector('.search-suggestion-item') as HTMLElement | null)?.focus();
      e.preventDefault();
    }
  });

  document.addEventListener('click', (e: MouseEvent) => {
    if (!(e.target as Element).closest('.search-wrapper')) hideSuggestions();
  });

  return { hideSuggestions };
}
