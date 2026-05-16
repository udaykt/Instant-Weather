// forecastCards.ts — renders the 5-day and hourly forecast strips.
// Icons are plain lazy-loaded PNGs from the WeatherAPI CDN.

import type { ForecastDay, HourData } from '@/shared/types/weatherTypes';
import { hourLabel } from './timeLabels';

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function renderHourlyForecast(hours: HourData[], currentHour: number): void {
  const container = document.getElementById('forecast-cards');
  if (!container) return;

  const slice = hours.slice(currentHour, currentHour + 12);
  container.classList.add('hourly-mode');

  container.innerHTML = slice
    .map((h) => {
      const label = hourLabel(h.time);
      const icon = `https:${h.condition.icon}`;
      const temp = Math.round(h.temp_c);
      const rain = h.chance_of_rain;

      return `
      <div class="forecast-card" role="listitem"
           aria-label="${label}: ${h.condition.text}, ${temp}°C, Rain ${rain}%">
        <div class="forecast-day">${label}</div>
        <img class="forecast-icon" src="${icon}" alt="${h.condition.text}" loading="lazy" decoding="async" width="36" height="36" />
        <div class="forecast-meta">
          <div class="forecast-desc">${h.condition.text}</div>
          ${rain > 0 ? `<div class="forecast-rain">💧 ${rain}%</div>` : ''}
        </div>
        <div class="forecast-right">
          <div class="forecast-temps">
            <span class="forecast-high">${temp}°</span>
          </div>
          <div class="forecast-wind">${Math.round(h.wind_kph)} kph</div>
        </div>
      </div>`;
    })
    .join('');
}

export function renderForecastCards(days: ForecastDay[]): void {
  const container = document.getElementById('forecast-cards');
  if (!container) return;

  container.classList.remove('hourly-mode');

  container.innerHTML = days
    .map((day, i) => {
      const date = new Date(`${day.date}T00:00:00`);
      const label = i === 0 ? 'Today' : SHORT_DAYS[date.getDay()];
      const icon = `https:${day.day.condition.icon}`;
      const high = Math.round(day.day.maxtemp_c);
      const low = Math.round(day.day.mintemp_c);
      const desc = day.day.condition.text;
      const rain = day.day.daily_chance_of_rain;
      const snow = day.day.daily_chance_of_snow;
      const wind = Math.round(day.day.maxwind_kph);
      const precip = day.day.totalprecip_mm;
      const rainSnow = snow > 0 ? `❄ ${snow}%` : rain > 0 ? `💧 ${rain}%` : '';

      return `
      <div class="forecast-card" role="listitem"
           aria-label="${label}: ${desc}, High ${high}° Low ${low}°, Rain ${rain}%">
        <div class="forecast-day">${label}</div>
        <img class="forecast-icon" src="${icon}" alt="${desc}" loading="lazy" decoding="async" width="36" height="36" />
        <div class="forecast-meta">
          <div class="forecast-desc">${desc}</div>
          ${rainSnow ? `<div class="forecast-rain">${rainSnow}${precip > 0 ? ` · ${precip}mm` : ''}</div>` : ''}
        </div>
        <div class="forecast-right">
          <div class="forecast-temps">
            <span class="forecast-high">${high}°</span>
            <span class="forecast-low">${low}°</span>
          </div>
          <div class="forecast-wind">${wind} kph</div>
        </div>
      </div>`;
    })
    .join('');
}
