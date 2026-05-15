// quickCities.ts — sidebar quick-access cities (recents first, popular defaults to fill)

import type { WeatherResponse } from '@/shared/types/weatherTypes';

const RECENT_KEY = 'iw-recent-cities';
const MAX_RECENT = 3;
const POPULAR_DEFAULTS = ['London', 'New York', 'Tokyo', 'Dubai', 'Sydney'];

export function trackRecentCity(cityName: string): void {
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    const recent: string[] = stored ? (JSON.parse(stored) as string[]) : [];
    const updated = [
      cityName,
      ...recent.filter((c) => c.toLowerCase() !== cityName.toLowerCase()),
    ].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    /* storage unavailable — silent */
  }
}

function getRecentCities(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

// Build ordered list: other recents, then popular cities (no duplicates), capped
// at 5. recent[0] is the city currently being viewed (trackRecentCity unshifts
// it on every successful fetch) — drop it so the active city is never offered
// as a shortcut to itself.
function buildCityList(): string[] {
  const recent = getRecentCities().slice(1);
  const recentLower = new Set(recent.map((c) => c.toLowerCase()));
  const extras = POPULAR_DEFAULTS.filter((c) => !recentLower.has(c.toLowerCase()));
  return [...recent, ...extras].slice(0, 5);
}

function renderCard(
  data: {
    name: string;
    country: string;
    temp_c: number;
    temp_f: number;
    condition: { text: string; icon: string };
  },
  onSelect: (city: string) => void,
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'quick-city-card';
  btn.setAttribute('role', 'listitem');
  btn.setAttribute(
    'aria-label',
    `${data.name}, ${data.country}: ${Math.round(data.temp_c)}°C, ${data.condition.text}`,
  );

  const icon = document.createElement('img');
  icon.className = 'qc-icon';
  icon.src = `https:${data.condition.icon}`;
  icon.alt = data.condition.text;
  icon.width = 36;
  icon.height = 36;
  icon.loading = 'lazy';

  const info = document.createElement('div');
  info.className = 'qc-info';

  const name = document.createElement('span');
  name.className = 'qc-name';
  name.textContent = data.name;

  const desc = document.createElement('span');
  desc.className = 'qc-desc';
  desc.textContent = data.condition.text;

  info.appendChild(name);
  info.appendChild(desc);

  const temp = document.createElement('span');
  temp.className = 'qc-temp';
  // Carry both units so the global toggle can re-render without re-fetching
  temp.dataset.c = String(data.temp_c);
  temp.dataset.f = String(data.temp_f);
  const unit = localStorage.getItem('tempUnit') === 'F' ? 'F' : 'C';
  temp.textContent = `${Math.round(unit === 'F' ? data.temp_f : data.temp_c)}°`;

  btn.appendChild(icon);
  btn.appendChild(info);
  btn.appendChild(temp);
  btn.addEventListener('click', () => onSelect(data.name));

  return btn;
}

export async function initQuickCities(
  container: HTMLElement,
  fetchByCity: (city: string) => Promise<WeatherResponse>,
  onSelect: (city: string) => void,
): Promise<void> {
  const cities = buildCityList();

  // Show skeletons while fetching
  container.innerHTML = cities
    .map(() => '<div class="qc-skeleton skeleton-card" aria-hidden="true"></div>')
    .join('');

  // Fetch all cities in parallel
  const results = await Promise.allSettled(cities.map((c) => fetchByCity(c)));

  container.innerHTML = '';
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      const { location, current } = result.value;
      const card = renderCard(
        {
          name: location.name,
          country: location.country,
          temp_c: current.temp_c,
          temp_f: current.temp_f,
          condition: current.condition,
        },
        onSelect,
      );
      container.appendChild(card);
    } else {
      // City fetch failed — show a minimal fallback label
      const fallback = document.createElement('div');
      fallback.className = 'qc-error';
      fallback.textContent = cities[i];
      container.appendChild(fallback);
    }
  });
}
