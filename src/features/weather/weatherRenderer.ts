// weatherRenderer.ts — typed DOM/UI updates with aurora theme

import lottie, { type AnimationItem } from 'lottie-web';
import type {
  WeatherResponse,
  TemperatureState,
  AirQuality,
  ForecastDay,
  HourData,
  Alert,
} from '@/shared/types/weatherTypes';
import { formatForecastDate, getDaytimePhase } from '@/shared/utils/weatherUtils';
import { getBestOutdoorWindow } from '@/features/weather/bestTimeAdvisor';
import { flagUrl } from '@/shared/utils/countryFlags';

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

// ── Module-level state ────────────────────────────────────────────────────────
let lastWeatherData: WeatherResponse | null = null;
let mainLottieInstance: AnimationItem | null = null;
const forecastLottieInstances: AnimationItem[] = [];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Unit system ───────────────────────────────────────────────────────────────
// Single source of truth: every temperature on screen (main, feels-like, hi/lo,
// dew point, sidebar) is re-rendered from this snapshot whenever the unit flips.
type Unit = 'C' | 'F';

interface UnitSnapshot {
  tC: number;
  tF: number;
  flC: number;
  flF: number;
  hiC: number;
  hiF: number;
  loC: number;
  loF: number;
  dewC: number;
  dewF: number;
}

let unitSnapshot: UnitSnapshot | null = null;

const cToF = (c: number): number => (c * 9) / 5 + 32;

// Smoothly counts the hero temperature to its target. Reduced-motion users get
// an instant set; NaN/equal values short-circuit so it can never wedge.
let tempRaf = 0;
function countUpTemp(el: HTMLElement, to: number): void {
  const target = Math.round(to);
  if (!Number.isFinite(target)) return;
  if (reducedMotion) {
    el.textContent = `${target}°`;
    return;
  }
  const parsed = parseInt(el.textContent ?? '', 10);
  const from = Number.isFinite(parsed) ? parsed : target;
  if (from === target) {
    el.textContent = `${target}°`;
    return;
  }
  cancelAnimationFrame(tempRaf);
  const dur = 480;
  const t0 = performance.now();
  const step = (now: number): void => {
    const p = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = `${Math.round(from + (target - from) * eased)}°`;
    if (p < 1) tempRaf = requestAnimationFrame(step);
  };
  tempRaf = requestAnimationFrame(step);
}

export function getSavedUnit(): Unit {
  return localStorage.getItem('tempUnit') === 'F' ? 'F' : 'C';
}

export function applyTempUnit(unit: Unit): void {
  localStorage.setItem('tempUnit', unit);

  // Segmented toggle visual state
  document.querySelectorAll<HTMLButtonElement>('.unit-btn').forEach((btn) => {
    const on = btn.dataset.unit === unit;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
  });

  // Slide the pill behind the active button (measured, so it never drifts).
  const toggle = qsMaybe<HTMLElement>('.unit-toggle');
  const activeBtn = qsMaybe<HTMLButtonElement>(`.unit-btn[data-unit="${unit}"]`);
  if (toggle && activeBtn && activeBtn.offsetWidth > 0) {
    toggle.style.setProperty('--unit-x', `${activeBtn.offsetLeft}px`);
    toggle.style.setProperty('--unit-w', `${activeBtn.offsetWidth}px`);
  }

  // Sidebar quick-city temps carry both values as data attributes
  document.querySelectorAll<HTMLElement>('.qc-temp[data-c]').forEach((el) => {
    const raw = unit === 'C' ? el.dataset.c : el.dataset.f;
    if (raw !== undefined) el.textContent = `${Math.round(Number(raw))}°`;
  });

  if (!unitSnapshot) return;
  const s = unitSnapshot;
  const isC = unit === 'C';

  const tempEl = qsMaybe<HTMLElement>('.temperature-reading');
  if (tempEl) countUpTemp(tempEl, isC ? s.tC : s.tF);

  const feelEl = qsMaybe<HTMLElement>('.temperature-real-feel');
  if (feelEl) feelEl.textContent = `Feels like ${Math.round(isC ? s.flC : s.flF)}°${unit}`;

  const hlEl = qsMaybe<HTMLElement>('.today-hl-val');
  if (hlEl)
    hlEl.textContent = `↑${Math.round(isC ? s.hiC : s.hiF)}°  ↓${Math.round(isC ? s.loC : s.loF)}°`;

  const dewEl = qsMaybe<HTMLElement>('.dewpoint-value');
  if (dewEl) dewEl.textContent = `${Math.round(isC ? s.dewC : s.dewF)}°${unit}`;
}

// ── Lottie helpers ────────────────────────────────────────────────────────────

/**
 * Maps WeatherAPI condition codes to Meteocons animated JSON filenames.
 * Place the Meteocons pack files in /public/assets/lottie/.
 * Download from: https://github.com/basmilius/weather-icons (production/fill/lottie)
 */
function conditionToLottie(code: number, isDay: boolean): string {
  const dn = isDay ? 'day' : 'night';
  if (code === 1000) return `clear-${dn}.json`;
  if (code === 1003) return `partly-cloudy-${dn}.json`;
  if (code === 1006 || code === 1009) return 'overcast.json';
  if (code === 1030 || code === 1135 || code === 1147) return 'fog.json';
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'thunderstorms.json';
  if (
    [
      1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249,
      1252, 1255, 1258, 1261, 1264,
    ].includes(code)
  )
    return 'snow.json';
  return 'rain.json';
}

function loadLottieInto(container: HTMLElement, lottieFile: string): AnimationItem | null {
  if (reducedMotion) return null;
  const anim = lottie.loadAnimation({
    container,
    path: `/assets/lottie/${lottieFile}`,
    renderer: 'svg',
    loop: true,
    autoplay: true,
  });
  anim.addEventListener('data_failed', () => {
    // Lottie JSON not found — show the fallback img inside the container
    const img = container.querySelector<HTMLImageElement>('img');
    if (img) img.style.display = '';
    const svg = container.querySelector('svg:not(img)');
    if (svg) (svg as HTMLElement).style.display = 'none';
    anim.destroy();
  });
  anim.addEventListener('data_ready', () => {
    // Hide fallback img once animation loads successfully
    const img = container.querySelector<HTMLImageElement>('img');
    if (img) img.style.display = 'none';
  });
  return anim;
}

function refreshMainLottie(code: number, isDay: boolean, iconSrc: string, iconAlt: string): void {
  const container = qsMaybe<HTMLDivElement>('#icon-lottie');
  const fallbackImg = qsMaybe<HTMLImageElement>('#icon');
  if (!container) return;

  if (mainLottieInstance) {
    mainLottieInstance.destroy();
    mainLottieInstance = null;
  }

  // Always keep the fallback img up-to-date so it renders correctly if lottie is absent
  if (fallbackImg) {
    fallbackImg.src = iconSrc;
    fallbackImg.alt = iconAlt;
    fallbackImg.style.display = '';
  }

  if (!reducedMotion) {
    mainLottieInstance = loadLottieInto(container, conditionToLottie(code, isDay));
  }
}

function destroyForecastLottie(): void {
  forecastLottieInstances.forEach((a) => a.destroy());
  forecastLottieInstances.length = 0;
}

// ── Condition → aurora hue ────────────────────────────────────────────────────
function conditionToHue(code: number): number {
  if (code === 1000 || code === 1003) return 35;
  if (code === 1006 || code === 1009) return 220;
  if (code === 1030 || code === 1135 || code === 1147) return 210;
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 270;
  if (
    [
      1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249,
      1252, 1255, 1258, 1261, 1264,
    ].includes(code)
  )
    return 195;
  return 200;
}

function uvLabel(uv: number): { text: string; level: string } {
  if (uv <= 2) return { text: 'Low', level: 'low' };
  if (uv <= 5) return { text: 'Moderate', level: 'moderate' };
  if (uv <= 7) return { text: 'High', level: 'high' };
  if (uv <= 10) return { text: 'Very High', level: 'very-high' };
  return { text: 'Extreme', level: 'extreme' };
}

// ── DOM helpers ───────────────────────────────────────────────────────────────
function qs<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: "${selector}"`);
  return el;
}

function qsMaybe<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

// ── Sun arc (Feature 1) ───────────────────────────────────────────────────────
function parseTimeToMinutes(timeStr: string): number {
  // Handles "06:30 AM", "6:30 AM", "06:30", "18:30"
  const clean = timeStr.trim();
  const ampm = /([ap]m)/i.exec(clean);
  const parts = clean.replace(/\s*(am|pm)/i, '').split(':');
  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] ?? '0', 10);
  if (ampm) {
    const period = ampm[1].toUpperCase();
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;
  }
  return h * 60 + m;
}

// The dot must travel *along* the curve (not cut a straight chord across it),
// so we drive it by arc-length using the SVG path itself and reveal a matching
// progress trail. prevSunLen lets each update glide from where it was.
let prevSunLen = 0;
let sunRaf = 0;

function bezierPoint(t: number): { x: number; y: number } {
  // Quadratic Bézier P0=(10,100) P1=(100,10) P2=(190,100) — happy-dom fallback.
  return {
    x: (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 100 + t * t * 190,
    y: (1 - t) * (1 - t) * 100 + 2 * (1 - t) * t * 10 + t * t * 100,
  };
}

function renderSunArc(sunriseStr: string, sunsetStr: string, localtime: string): void {
  const dot = document.getElementById('sun-dot') as SVGCircleElement | null;
  const path = document.getElementById('sun-arc-path') as unknown as SVGPathElement | null;
  const progress = document.getElementById('sun-arc-progress') as unknown as SVGPathElement | null;
  if (!dot) return;

  const [, timePart] = localtime.split(' ');
  const [hStr, mStr] = timePart.split(':');
  const nowMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
  const riseMinutes = parseTimeToMinutes(sunriseStr);
  const setMinutes = parseTimeToMinutes(sunsetStr);

  const t =
    setMinutes > riseMinutes
      ? Math.max(0, Math.min(1, (nowMinutes - riseMinutes) / (setMinutes - riseMinutes)))
      : nowMinutes < riseMinutes
        ? 0
        : 1;

  // happy-dom / older engines: no path geometry → snap via Bézier math.
  if (!path || typeof path.getTotalLength !== 'function') {
    const p = bezierPoint(t);
    dot.setAttribute('cx', String(Math.round(p.x * 10) / 10));
    dot.setAttribute('cy', String(Math.round(p.y * 10) / 10));
    return;
  }

  const total = path.getTotalLength();
  const targetLen = total * t;

  if (progress) {
    progress.style.strokeDasharray = String(total);
  }

  const apply = (len: number): void => {
    const pt = path.getPointAtLength(len);
    dot.setAttribute('cx', (Math.round(pt.x * 10) / 10).toString());
    dot.setAttribute('cy', (Math.round(pt.y * 10) / 10).toString());
    if (progress) progress.style.strokeDashoffset = String(total - len);
  };

  if (reducedMotion) {
    prevSunLen = targetLen;
    apply(targetLen);
    return;
  }

  cancelAnimationFrame(sunRaf);
  const fromLen = prevSunLen;
  const startTime = performance.now();
  const dur = 1100;
  const tick = (now: number): void => {
    const p = Math.min(1, (now - startTime) / dur);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    const len = fromLen + (targetLen - fromLen) * eased;
    apply(len);
    if (p < 1) {
      sunRaf = requestAnimationFrame(tick);
    } else {
      prevSunLen = targetLen;
    }
  };
  sunRaf = requestAnimationFrame(tick);
}

// ── Hourly sparkline (Features 3 + 16) ────────────────────────────────────────
const SPARK_H = 60;
const SPARK_PAD = 4;

// Geometry kept at module scope so the (once-bound) pointer handlers can read
// the latest data without rebinding on every re-render.
let sparkHours: HourData[] = [];
let sparkMin = 0;
let sparkRange = 1;
let sparkBound = false;

/** Fractional [0..1] vertical position of a temperature within the plot. */
function sparkFracY(t: number): number {
  const y = SPARK_H - SPARK_PAD - ((t - sparkMin) / sparkRange) * (SPARK_H - SPARK_PAD * 2);
  return y / SPARK_H;
}

function hourLabel(time: string): string {
  const tp = time.split(' ')[1] ?? time;
  const hr = parseInt(tp.split(':')[0], 10);
  if (Number.isNaN(hr)) return '--';
  return hr === 0 ? '12 AM' : hr < 12 ? `${hr} AM` : hr === 12 ? '12 PM' : `${hr - 12} PM`;
}

function placeSparkDot(index: number): void {
  const dot = document.getElementById('spark-dot');
  if (!dot || index < 0 || index >= sparkHours.length) return;
  const fx = (index / Math.max(1, sparkHours.length - 1)) * 100;
  const fy = sparkFracY(sparkHours[index].temp_c) * 100;
  dot.style.setProperty('--dx', `${fx}%`);
  dot.style.setProperty('--dy', `${fy}%`);
}

function bindSparkHover(): void {
  if (sparkBound) return;
  const plot = document.getElementById('sparkline-plot');
  const cursor = document.getElementById('spark-cursor');
  const tip = document.getElementById('spark-tip');
  if (!plot || !cursor || !tip) return;
  sparkBound = true;

  const move = (clientX: number): void => {
    if (sparkHours.length === 0) return;
    const rect = plot.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.round(frac * (sparkHours.length - 1));
    const h = sparkHours[idx];
    const fx = (idx / Math.max(1, sparkHours.length - 1)) * 100;
    cursor.style.setProperty('--cx', `${fx}%`);
    tip.style.setProperty('--cx', `${fx}%`);
    tip.textContent = `${hourLabel(h.time)} · ${Math.round(h.temp_c)}°`;
    plot.classList.add('is-hover');
  };

  plot.addEventListener('pointermove', (e) => move(e.clientX));
  plot.addEventListener('pointerdown', (e) => move(e.clientX));
  plot.addEventListener('pointerleave', () => plot.classList.remove('is-hover'));
  plot.addEventListener('pointercancel', () => plot.classList.remove('is-hover'));
}

export function renderSparkline(hours: HourData[], currentHour: number): void {
  const svg = document.getElementById('temp-sparkline') as SVGSVGElement | null;
  if (!svg || hours.length === 0) return;

  const W = 300;
  const temps = hours.map((h) => h.temp_c);
  const min = Math.min(...temps);
  const max = Math.max(...temps);

  sparkHours = hours;
  sparkMin = min;
  sparkRange = max - min || 1;

  const toX = (i: number) => (i / (hours.length - 1)) * W;
  const toY = (t: number) => sparkFracY(t) * SPARK_H;

  const points = hours.map((h, i) => `${toX(i).toFixed(1)},${toY(h.temp_c).toFixed(1)}`).join(' ');
  const polyPoints = `${points} ${W},${SPARK_H} 0,${SPARK_H}`;

  const gradId = 'sparkGrad';
  svg.innerHTML = `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,200,60,0.18)"/>
        <stop offset="100%" stop-color="rgba(255,200,60,0)"/>
      </linearGradient>
    </defs>
    <polygon points="${polyPoints}" fill="url(#${gradId})"/>
    <polyline points="${points}" fill="none" stroke="rgba(255,220,100,0.75)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  `;

  // Y axis: temperature range. X axis: start / midday / end times.
  const setText = (sel: string, val: string): void => {
    const el = qsMaybe<HTMLElement>(sel);
    if (el) el.textContent = val;
  };
  setText('.spark-min', `${Math.round(min)}°`);
  setText('.spark-max', `${Math.round(max)}°`);
  setText('.spark-x-start', hourLabel(hours[0].time));
  setText('.spark-x-mid', hourLabel(hours[Math.floor(hours.length / 2)].time));
  setText('.spark-x-end', hourLabel(hours[hours.length - 1].time));

  // Perfect-circle current-hour marker (HTML overlay, never distorted).
  placeSparkDot(Math.max(0, Math.min(hours.length - 1, currentHour)));
  bindSparkHover();
}

// ── Hourly forecast cards (Feature 5) ────────────────────────────────────────
export function renderHourlyForecast(hours: HourData[], currentHour: number): void {
  const container = document.getElementById('forecast-cards');
  if (!container) return;

  destroyForecastLottie();

  const slice = hours.slice(currentHour, currentHour + 12);
  container.classList.add('hourly-mode');

  container.innerHTML = slice
    .map((h) => {
      const timeParts = h.time.split(' ');
      const tp = timeParts[1] ?? h.time;
      const hr = parseInt(tp.split(':')[0], 10);
      const label =
        hr === 0 ? '12 AM' : hr < 12 ? `${hr} AM` : hr === 12 ? '12 PM' : `${hr - 12} PM`;
      const icon = `https:${h.condition.icon}`;
      const temp = Math.round(h.temp_c);
      const rain = h.chance_of_rain;
      const lottieFile = conditionToLottie(h.condition.code, h.is_day === 1);

      return `
      <div class="forecast-card" role="listitem"
           aria-label="${label}: ${h.condition.text}, ${temp}°C, Rain ${rain}%">
        <div class="forecast-day">${label}</div>
        <div class="forecast-icon-lottie" data-lottie="${lottieFile}">
          <img class="forecast-icon" src="${icon}" alt="${h.condition.text}" loading="lazy" />
        </div>
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

  attachForecastLottie(container);
}

function attachForecastLottie(container: HTMLElement): void {
  if (reducedMotion) return;
  container.querySelectorAll<HTMLElement>('[data-lottie]').forEach((el) => {
    const file = el.dataset.lottie;
    if (!file) return;
    const anim = loadLottieInto(el, file);
    if (anim) forecastLottieInstances.push(anim);
  });
}

// ── 5-day forecast cards ──────────────────────────────────────────────────────
export function renderForecastCards(days: ForecastDay[]): void {
  const container = document.getElementById('forecast-cards');
  if (!container) return;

  destroyForecastLottie();
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
      const lottieFile = conditionToLottie(day.day.condition.code, true);

      return `
      <div class="forecast-card" role="listitem"
           aria-label="${label}: ${desc}, High ${high}° Low ${low}°, Rain ${rain}%">
        <div class="forecast-day">${label}</div>
        <div class="forecast-icon-lottie" data-lottie="${lottieFile}">
          <img class="forecast-icon" src="${icon}" alt="${desc}" loading="lazy" />
        </div>
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

  attachForecastLottie(container);
}

// ── Alerts banner (Feature 8) ─────────────────────────────────────────────────
export function renderAlerts(alerts?: Alert[]): void {
  const container = document.getElementById('alerts-container');
  if (!container) return;
  container.innerHTML = '';
  if (!alerts || alerts.length === 0) return;

  alerts.forEach((alert) => {
    const banner = document.createElement('div');
    banner.className = 'alert-banner';
    banner.dataset.severity = alert.severity.toLowerCase();

    const truncDesc =
      alert.desc.length > 120 ? `${alert.desc.slice(0, 120).trimEnd()}…` : alert.desc;

    banner.innerHTML = `
      <span class="alert-icon" aria-hidden="true">⚠️</span>
      <div class="alert-body">
        <strong>${alert.headline}</strong>
        <p>${truncDesc}</p>
      </div>
      <button class="alert-dismiss" aria-label="Dismiss alert">✕</button>`;

    banner.querySelector('.alert-dismiss')?.addEventListener('click', () => banner.remove());
    container.appendChild(banner);
  });
}

// ── AQI badge + popover (Features — AQI badge wiring stays in main.ts) ───────
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

  // Populate popover
  const popover = document.getElementById('aqi-popover');
  if (!popover) return;

  const pollutants: [string, number | undefined, string][] = [
    ['CO', aqi.co, 'µg/m³'],
    ['NO₂', aqi.no2, 'µg/m³'],
    ['O₃', aqi.o3, 'µg/m³'],
    ['SO₂', aqi.so2, 'µg/m³'],
    ['PM2.5', aqi.pm2_5, 'µg/m³'],
    ['PM10', aqi.pm10, 'µg/m³'],
  ];

  popover.innerHTML = pollutants
    .filter(([, val]) => val !== undefined)
    .map(
      ([name, val, unit]) =>
        `<div class="aqi-row">
          <span class="aqi-pollutant">${name}</span>
          <span class="aqi-value">${typeof val === 'number' ? val.toFixed(1) : '--'} ${unit}</span>
        </div>`,
    )
    .join('');
}

// ── Moon phase ────────────────────────────────────────────────────────────────
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

// ── Skeleton removal ──────────────────────────────────────────────────────────
function removeSkeleton(): void {
  document.querySelectorAll('.skeleton-text').forEach((el) => el.classList.remove('skeleton-text'));
  document.querySelectorAll('.skeleton-card').forEach((el) => el.classList.remove('skeleton-card'));
}

// ── Main render entry point ───────────────────────────────────────────────────
export function renderForecast(
  weatherData: WeatherResponse,
  currentConditions: TemperatureState,
): void {
  if (!weatherData?.current) return;
  lastWeatherData = weatherData;
  const { location, current, forecast } = weatherData;

  // ── Aurora theme ────────────────────────────────────────────────────────────
  const hue = conditionToHue(current.condition.code);
  document.documentElement.style.setProperty('--cond-hue', String(hue));

  // ── Daytime phase ────────────────────────────────────────────────────────────
  const [, timePart] = location.localtime.split(' ');
  const hour = Number(timePart.split(':')[0]);
  const daytimePhase = getDaytimePhase(hour);
  document.body.style.backgroundImage = daytimePhase.gradient;
  document.body.classList.toggle('light-bg', daytimePhase.isLight);

  // ── Location ─────────────────────────────────────────────────────────────────
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

  // ── Condition text + icon ─────────────────────────────────────────────────────
  const { condition } = current;
  qs<HTMLDivElement>('.weather-description').textContent = condition.text;
  refreshMainLottie(
    condition.code,
    current.is_day !== undefined ? Boolean(current.is_day) : hour >= 6 && hour < 20,
    `https:${condition.icon}`,
    condition.text,
  );

  // ── Time of day label ─────────────────────────────────────────────────────────
  qs<HTMLDivElement>('.part-of-day').textContent = daytimePhase.name;

  // ── Date + time ───────────────────────────────────────────────────────────────
  const jsDate = new Date(location.localtime.replace(/-/g, '/'));
  qs<HTMLSpanElement>('.date').textContent = formatForecastDate(jsDate);
  qs<HTMLSpanElement>('.time').textContent = timePart;

  // ── Temperatures (snapshot everything, render via the unit system) ───────────
  const day0 = forecast?.forecastday?.[0]?.day;
  unitSnapshot = {
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
  };
  Object.assign(currentConditions, {
    temp_c: Math.round(current.temp_c),
    temp_f: Math.round(current.temp_f),
    feelslike_c: Math.round(current.feelslike_c),
    feelslike_f: Math.round(current.feelslike_f),
  });
  applyTempUnit(getSavedUnit());

  // ── Core stats ────────────────────────────────────────────────────────────────
  qs<HTMLElement>('.humidity-value').textContent = `${current.humidity}%`;
  qs<HTMLElement>('.wind-value').textContent = `${Math.round(current.wind_kph)} kph`;
  const windDirEl = qsMaybe<HTMLElement>('.wind-dir');
  if (windDirEl) windDirEl.textContent = current.wind_dir;
  const centerWindEl = qsMaybe<HTMLElement>('.center-wind-val');
  if (centerWindEl) centerWindEl.textContent = `${Math.round(current.wind_kph)} kph`;
  qs<HTMLElement>('.pressure-value').textContent = `${current.pressure_mb} mb`;

  // ── UV Index ──────────────────────────────────────────────────────────────────
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

  // ── Visibility ────────────────────────────────────────────────────────────────
  const visEl = qsMaybe<HTMLElement>('.vis-value');
  if (visEl) visEl.textContent = `${current.vis_km} km`;

  // ── Precipitation ─────────────────────────────────────────────────────────────
  const precipEl = qsMaybe<HTMLElement>('.precip-value');
  if (precipEl) precipEl.textContent = `${current.precip_mm} mm`;

  // ── Dew Point note (the value itself is rendered by applyTempUnit) ───────────
  const dewNoteEl = qsMaybe<HTMLElement>('.dewpoint-note');
  if (dewNoteEl) {
    const dp = current.dewpoint_c;
    dewNoteEl.textContent =
      dp >= 24 ? 'Very Humid' : dp >= 18 ? 'Humid' : dp >= 13 ? 'Comfortable' : 'Dry';
  }

  // ── Astro ─────────────────────────────────────────────────────────────────────
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

    // Sun arc
    renderSunArc(astro.sunrise, astro.sunset, location.localtime);
  }

  // ── Chance of rain today ──────────────────────────────────────────────────────
  const rainChanceEl = qsMaybe<HTMLElement>('.rain-chance-value');
  if (rainChanceEl) rainChanceEl.textContent = day0 ? `${day0.daily_chance_of_rain}%` : '—';

  // ── AQI ───────────────────────────────────────────────────────────────────────
  if (current.air_quality) renderAQI(current.air_quality);

  // ── Alerts ────────────────────────────────────────────────────────────────────
  renderAlerts(weatherData.alerts?.alert);

  // ── Sparkline ─────────────────────────────────────────────────────────────────
  const todayHours = forecast?.forecastday?.[0]?.hour ?? ([] as HourData[]);
  if (todayHours.length > 0) renderSparkline(todayHours, hour);

  // ── Best time ─────────────────────────────────────────────────────────────────
  const bestHint = qsMaybe<HTMLElement>('#best-time-hint');
  if (bestHint && todayHours.length > 0) {
    bestHint.textContent = getBestOutdoorWindow(todayHours as HourData[]);
  }

  // ── 5-day forecast (reset toggle to 5-day on city change) ────────────────────
  document.querySelectorAll<HTMLButtonElement>('.forecast-toggle-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === '5day');
  });
  if (forecast?.forecastday) renderForecastCards(forecast.forecastday);

  removeSkeleton();
  (document.getElementById('main-block') as HTMLElement)?.setAttribute('aria-busy', 'false');
}

export function getLastWeatherData(): WeatherResponse | null {
  return lastWeatherData;
}
