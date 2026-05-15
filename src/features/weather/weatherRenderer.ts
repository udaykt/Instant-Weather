// weatherRenderer.ts — typed DOM/UI updates with aurora theme

import type {
  WeatherResponse,
  TemperatureState,
  AirQuality,
  ForecastDay,
} from '@/shared/types/weatherTypes';
import { formatForecastDate, getDaytimePhase } from '@/shared/utils/weatherUtils';

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AQI_LABELS = [
  '',
  'Good',
  'Moderate',
  'Unhealthy (Sensitive)',
  'Unhealthy',
  'Very Unhealthy',
  'Hazardous',
];
const AQI_COLORS = ['', '#00c853', '#ffd600', '#ff6d00', '#d50000', '#6a1b9a', '#37474f'];
const AQI_TEXT = ['', '#000', '#000', '#fff', '#fff', '#fff', '#fff'];

// Maps WeatherAPI condition codes to aurora hue (degrees on the color wheel)
function conditionToHue(code: number): number {
  if (code === 1000 || code === 1003) return 35; // Sunny / partly cloudy — warm gold
  if (code === 1006 || code === 1009) return 220; // Cloudy / overcast — steel blue
  if (code === 1030 || code === 1135 || code === 1147) return 210; // Fog / mist — grey-blue
  // Thunder
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 270;
  // Snow / sleet / ice
  if (
    [
      1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249,
      1252, 1255, 1258, 1261, 1264,
    ].includes(code)
  )
    return 195;
  // Default: rain / drizzle — ocean blue
  return 200;
}

function uvLabel(uv: number): { text: string; level: string } {
  if (uv <= 2) return { text: 'Low', level: 'low' };
  if (uv <= 5) return { text: 'Moderate', level: 'moderate' };
  if (uv <= 7) return { text: 'High', level: 'high' };
  if (uv <= 10) return { text: 'Very High', level: 'very-high' };
  return { text: 'Extreme', level: 'extreme' };
}

// Typed querySelector — throws if element is missing
function qs<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: "${selector}"`);
  return el;
}

// Nullable version — no throw
function qsMaybe<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

export function renderForecast(
  weatherData: WeatherResponse,
  currentConditions: TemperatureState,
): void {
  if (!weatherData?.current) return;
  const { location, current, forecast } = weatherData;

  // ── Aurora theme: set condition hue on :root ────────────────────────────
  const hue = conditionToHue(current.condition.code);
  document.documentElement.style.setProperty('--cond-hue', String(hue));

  // ── Daytime phase: set gradient on body ─────────────────────────────────
  const [, timePart] = location.localtime.split(' ');
  const hour = Number(timePart.split(':')[0]);
  const daytimePhase = getDaytimePhase(hour);
  document.body.style.backgroundImage = daytimePhase.gradient;
  document.body.classList.toggle('light-bg', daytimePhase.isLight);

  // ── Location ─────────────────────────────────────────────────────────────
  qs<HTMLSpanElement>('.city').textContent = location.name;
  qs<HTMLSpanElement>('.country').textContent = location.country;

  // ── Condition text + icon ────────────────────────────────────────────────
  const { condition } = current;
  qs<HTMLDivElement>('.weather-description').textContent = condition.text;
  const conditionIcon = document.getElementById('icon') as HTMLImageElement;
  conditionIcon.src = `https:${condition.icon}`;
  conditionIcon.alt = condition.text;

  // ── Time of day label ─────────────────────────────────────────────────────
  qs<HTMLDivElement>('.part-of-day').textContent = daytimePhase.name;

  // ── Date + time ───────────────────────────────────────────────────────────
  const jsDate = new Date(location.localtime.replace(/-/g, '/'));
  qs<HTMLSpanElement>('.date').textContent = `${formatForecastDate(jsDate)},`;
  qs<HTMLSpanElement>('.time').textContent = ` ${timePart}`;

  // ── Temperatures ──────────────────────────────────────────────────────────
  const temp_c = Math.round(current.temp_c);
  const temp_f = Math.round(current.temp_f);
  const feelslike_c = Math.round(current.feelslike_c);
  const feelslike_f = Math.round(current.feelslike_f);

  qs<HTMLDivElement>('.temperature-reading').textContent = `${temp_c}°`;
  qs<HTMLDivElement>('.temperature-real-feel').textContent = `Feels like ${feelslike_c}°C`;
  const feelslikeStatEl = qsMaybe<HTMLElement>('.feelslike-stat-value');
  if (feelslikeStatEl) feelslikeStatEl.textContent = `${feelslike_c}°C`;
  Object.assign(currentConditions, { temp_c, temp_f, feelslike_c, feelslike_f });

  // Always reset unit toggle to C on new city data
  const toggleBtn = qs<HTMLButtonElement>('.temperature-degree');
  toggleBtn.value = 'C';
  toggleBtn.textContent = 'C';

  // ── Core stats ────────────────────────────────────────────────────────────
  qs<HTMLElement>('.humidity-value').textContent = `${current.humidity}%`;
  qs<HTMLElement>('.wind-value').textContent = `${current.wind_kph} kph ${current.wind_dir}`;
  qs<HTMLElement>('.pressure-value').textContent = `${current.pressure_mb} mb`;

  // ── UV Index ──────────────────────────────────────────────────────────────
  const uvEl = qsMaybe<HTMLElement>('.uv-value');
  if (uvEl) {
    const uv = Math.round(current.uv);
    uvEl.textContent = String(uv);
    const uvLevelEl = qsMaybe<HTMLElement>('.uv-level');
    if (uvLevelEl) {
      const { text, level } = uvLabel(uv);
      uvLevelEl.textContent = text;
      uvLevelEl.dataset.level = level;
    }
  }

  // ── Visibility ────────────────────────────────────────────────────────────
  const visEl = qsMaybe<HTMLElement>('.vis-value');
  if (visEl) visEl.textContent = `${current.vis_km} km`;

  // ── Precipitation ─────────────────────────────────────────────────────────
  const precipEl = qsMaybe<HTMLElement>('.precip-value');
  if (precipEl) precipEl.textContent = `${current.precip_mm} mm`;

  // ── Cloud Cover ───────────────────────────────────────────────────────────
  const cloudEl = qsMaybe<HTMLElement>('.cloud-value');
  if (cloudEl) cloudEl.textContent = `${current.cloud}%`;

  // ── Dew Point ─────────────────────────────────────────────────────────────
  const dewEl = qsMaybe<HTMLElement>('.dewpoint-value');
  if (dewEl) {
    dewEl.textContent = `${Math.round(current.dewpoint_c)}°C`;
    const noteEl = qsMaybe<HTMLElement>('.dewpoint-note');
    if (noteEl) {
      const dp = current.dewpoint_c;
      noteEl.textContent =
        dp >= 24 ? 'Very Humid' : dp >= 18 ? 'Humid' : dp >= 13 ? 'Comfortable' : 'Dry';
    }
  }

  // ── Astro (sunrise, sunset, moon phase) from first forecast day ──────────
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
  }

  // ── Center today highlights ───────────────────────────────────────────────
  const centerUV = qsMaybe<HTMLElement>('.center-uv-val');
  if (centerUV) {
    const uv = Math.round(current.uv);
    centerUV.textContent = `${uv} · ${uvLabel(uv).text}`;
  }

  const centerVis = qsMaybe<HTMLElement>('.center-vis-val');
  if (centerVis) centerVis.textContent = `${current.vis_km} km`;

  if (forecast?.forecastday?.[0]) {
    const todayDay = forecast.forecastday[0].day;
    const hlEl = qsMaybe<HTMLElement>('.today-hl-val');
    if (hlEl)
      hlEl.textContent = `${Math.round(todayDay.maxtemp_c)}° / ${Math.round(todayDay.mintemp_c)}°`;
    const rainEl = qsMaybe<HTMLElement>('.today-rain-val');
    if (rainEl) rainEl.textContent = `${todayDay.daily_chance_of_rain}%`;
  }

  // ── AQI ───────────────────────────────────────────────────────────────────
  if (current.air_quality) renderAQI(current.air_quality);

  // ── 5-day forecast ────────────────────────────────────────────────────────
  if (forecast?.forecastday) renderForecastCards(forecast.forecastday);

  removeSkeleton();
  (document.getElementById('main-block') as HTMLElement)?.setAttribute('aria-busy', 'false');
}

function moonPhaseEmoji(phase: string): string {
  const p = phase.toLowerCase();
  if (p.includes('new')) return '🌑';
  if (p.includes('waxing crescent')) return '🌒';
  if (p.includes('first quarter')) return '🌓';
  if (p.includes('waxing gibbous')) return '🌔';
  if (p.includes('full')) return '🌕';
  if (p.includes('waning gibbous')) return '🌖';
  if (p.includes('last quarter') || p.includes('third quarter')) return '🌗';
  if (p.includes('waning crescent')) return '🌘';
  return '🌙';
}

function renderAQI(aqi: AirQuality): void {
  const badge = document.getElementById('aqi-badge') as HTMLDivElement | null;
  if (!badge) return;
  const idx = aqi['us-epa-index'];
  if (!idx || idx < 1 || idx > 6) {
    badge.textContent = '';
    return;
  }
  badge.textContent = `AQI · ${AQI_LABELS[idx]}`;
  badge.style.backgroundColor = AQI_COLORS[idx];
  badge.style.color = AQI_TEXT[idx];
}

function renderForecastCards(days: ForecastDay[]): void {
  const container = document.getElementById('forecast-cards');
  if (!container) return;
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
        <img class="forecast-icon" src="${icon}" alt="${desc}" loading="lazy" />
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

function removeSkeleton(): void {
  document.querySelectorAll('.skeleton-text').forEach((el) => el.classList.remove('skeleton-text'));
  document.querySelectorAll('.skeleton-card').forEach((el) => el.classList.remove('skeleton-card'));
}

export function formatTemperature(unit: string, currentConditions: TemperatureState): void {
  const toggle = qs<HTMLButtonElement>('.temperature-degree');
  const tempEl = qs<HTMLDivElement>('.temperature-reading');
  const feelEl = qs<HTMLDivElement>('.temperature-real-feel');
  if (unit === 'C') {
    toggle.value = 'F';
    toggle.textContent = 'F';
    tempEl.textContent = `${currentConditions.temp_f}°`;
    feelEl.textContent = `Feels like ${currentConditions.feelslike_f}°F`;
  } else {
    toggle.value = 'C';
    toggle.textContent = 'C';
    tempEl.textContent = `${currentConditions.temp_c}°`;
    feelEl.textContent = `Feels like ${currentConditions.feelslike_c}°C`;
  }
}
