// airQuality.ts — AQI badge colour/label + the pollutant breakdown popover.

import type { AirQuality } from '@/shared/types/weatherTypes';

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

export function renderAQI(aqi: AirQuality): void {
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
