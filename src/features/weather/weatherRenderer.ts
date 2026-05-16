// weatherRenderer.ts — orchestrator. Pulls the typed WeatherAPI response apart
// and hands each slice to a focused render module. All public render API is
// re-exported here so callers keep one stable import path.

import type { WeatherResponse, TemperatureState } from '@/shared/types/weatherTypes';
import { formatForecastDate, getDaytimePhase } from '@/shared/utils/weatherUtils';
import { getBestOutdoorWindow } from '@/features/weather/bestTimeAdvisor';
import { flagUrl } from '@/shared/utils/countryFlags';

import { qs, qsMaybe } from './render/dom';
import { conditionToHue } from './render/aurora';
import { setWeatherIcon } from './render/weatherIcon';
import { applyTempUnit, getSavedUnit, cToF, setUnitSnapshot } from './render/unitSystem';
import { renderSunArc } from './render/sunArc';
import { renderSparkline } from './render/sparkline';
import { renderForecastCards } from './render/forecastCards';
import { renderAQI } from './render/airQuality';
import { renderAlerts } from './render/alerts';
import { moonPhaseEmoji } from './render/moonPhase';

// Re-exported public surface (main.ts, tests, resize handlers).
export { applyTempUnit, getSavedUnit, formatTemperature } from './render/unitSystem';
export { renderForecastCards, renderHourlyForecast } from './render/forecastCards';
export { renderSparkline } from './render/sparkline';

let lastWeatherData: WeatherResponse | null = null;

function uvLabel(uv: number): { text: string; level: string } {
  if (uv <= 2) return { text: 'Low', level: 'low' };
  if (uv <= 5) return { text: 'Moderate', level: 'moderate' };
  if (uv <= 7) return { text: 'High', level: 'high' };
  if (uv <= 10) return { text: 'Very High', level: 'very-high' };
  return { text: 'Extreme', level: 'extreme' };
}

function removeSkeleton(): void {
  document.querySelectorAll('.skeleton-text').forEach((el) => el.classList.remove('skeleton-text'));
  document.querySelectorAll('.skeleton-card').forEach((el) => el.classList.remove('skeleton-card'));
}

export function renderForecast(
  weatherData: WeatherResponse,
  currentConditions: TemperatureState,
): void {
  if (!weatherData?.current) return;
  lastWeatherData = weatherData;
  const { location, current, forecast } = weatherData;

  // Aurora theme + daytime phase
  document.documentElement.style.setProperty(
    '--cond-hue',
    String(conditionToHue(current.condition.code)),
  );
  const [, timePart] = location.localtime.split(' ');
  const hour = Number(timePart.split(':')[0]);
  const daytimePhase = getDaytimePhase(hour);
  document.body.style.backgroundImage = daytimePhase.gradient;
  document.body.classList.toggle('light-bg', daytimePhase.isLight);

  // Location + flag
  qs<HTMLSpanElement>('.city').textContent = location.name;
  qs<HTMLSpanElement>('.country').textContent = location.country;
  const flagEl = qsMaybe<HTMLImageElement>('.country-flag');
  if (flagEl) {
    const url = flagUrl(location.country);
    if (url) {
      flagEl.src = url;
      flagEl.alt = `${location.country} flag`;
      flagEl.hidden = false;
      flagEl.onerror = () => {
        flagEl.hidden = true;
      };
    } else {
      flagEl.hidden = true;
      flagEl.removeAttribute('src');
    }
  }

  // Condition text + icon
  const { condition } = current;
  qs<HTMLDivElement>('.weather-description').textContent = condition.text;
  setWeatherIcon(`https:${condition.icon}`, condition.text);

  // Date + time
  qs<HTMLDivElement>('.part-of-day').textContent = daytimePhase.name;
  const jsDate = new Date(location.localtime.replace(/-/g, '/'));
  qs<HTMLSpanElement>('.date').textContent = formatForecastDate(jsDate);
  qs<HTMLSpanElement>('.time').textContent = timePart;

  // Temperatures — snapshot everything, render through the unit system
  const day0 = forecast?.forecastday?.[0]?.day;
  setUnitSnapshot({
    tC: current.temp_c,
    tF: current.temp_f,
    flC: current.feelslike_c,
    flF: current.feelslike_f,
    hiC: day0 ? day0.maxtemp_c : current.temp_c,
    hiF: day0 ? cToF(day0.maxtemp_c) : current.temp_f,
    loC: day0 ? day0.mintemp_c : current.temp_c,
    loF: day0 ? cToF(day0.mintemp_c) : current.temp_f,
    dewC: current.dewpoint_c,
    dewF: cToF(current.dewpoint_c),
  });
  Object.assign(currentConditions, {
    temp_c: Math.round(current.temp_c),
    temp_f: Math.round(current.temp_f),
    feelslike_c: Math.round(current.feelslike_c),
    feelslike_f: Math.round(current.feelslike_f),
  });
  applyTempUnit(getSavedUnit());

  // Core stats
  qs<HTMLElement>('.humidity-value').textContent = `${current.humidity}%`;
  qs<HTMLElement>('.wind-value').textContent = `${Math.round(current.wind_kph)} kph`;
  const windDirEl = qsMaybe<HTMLElement>('.wind-dir');
  if (windDirEl) windDirEl.textContent = current.wind_dir;
  qs<HTMLElement>('.pressure-value').textContent = `${current.pressure_mb} mb`;

  const uvEl = qsMaybe<HTMLElement>('.uv-value');
  if (uvEl) {
    const uv = Math.round(current.uv);
    uvEl.textContent = String(uv);
    const uvLevelEl = qsMaybe<HTMLElement>('.uv-level');
    if (uvLevelEl) {
      const { text, level } = uvLabel(uv);
      uvLevelEl.textContent = `· ${text}`;
      uvLevelEl.dataset.level = level;
    }
  }

  const visEl = qsMaybe<HTMLElement>('.vis-value');
  if (visEl) visEl.textContent = `${current.vis_km} km`;

  const precipEl = qsMaybe<HTMLElement>('.precip-value');
  if (precipEl) precipEl.textContent = `${current.precip_mm} mm`;

  const dewNoteEl = qsMaybe<HTMLElement>('.dewpoint-note');
  if (dewNoteEl) {
    const dp = current.dewpoint_c;
    dewNoteEl.textContent =
      dp >= 24 ? 'Very Humid' : dp >= 18 ? 'Humid' : dp >= 13 ? 'Comfortable' : 'Dry';
  }

  // Astro
  const astro = forecast?.forecastday?.[0]?.astro;
  if (astro) {
    const sunriseEl = qsMaybe<HTMLElement>('.sunrise-value');
    if (sunriseEl) sunriseEl.textContent = astro.sunrise;
    const sunsetEl = qsMaybe<HTMLElement>('.sunset-value');
    if (sunsetEl) sunsetEl.textContent = astro.sunset;
    const moonEl = qsMaybe<HTMLElement>('.moon-phase-value');
    if (moonEl) moonEl.textContent = astro.moon_phase;
    const moonEmoji = qsMaybe<HTMLElement>('.moon-emoji');
    if (moonEmoji) moonEmoji.textContent = moonPhaseEmoji(astro.moon_phase);
    renderSunArc(astro.sunrise, astro.sunset, location.localtime);
  }

  const rainChanceEl = qsMaybe<HTMLElement>('.rain-chance-value');
  if (rainChanceEl) rainChanceEl.textContent = day0 ? `${day0.daily_chance_of_rain}%` : '—';

  if (current.air_quality) renderAQI(current.air_quality);
  renderAlerts(weatherData.alerts?.alert);

  const todayHours = forecast?.forecastday?.[0]?.hour ?? [];
  if (todayHours.length > 0) renderSparkline(todayHours, hour);

  const bestHint = qsMaybe<HTMLElement>('#best-time-hint');
  if (bestHint && todayHours.length > 0) {
    bestHint.textContent = getBestOutdoorWindow(todayHours);
  }

  document.querySelectorAll<HTMLButtonElement>('.forecast-toggle-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === '5day');
  });
  if (forecast?.forecastday) renderForecastCards(forecast.forecastday);

  removeSkeleton();
  document.getElementById('main-block')?.setAttribute('aria-busy', 'false');
}

export function getLastWeatherData(): WeatherResponse | null {
  return lastWeatherData;
}
