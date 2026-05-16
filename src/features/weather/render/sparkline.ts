// sparkline.ts — today's hourly temperature trend. The line/area live in a
// non-uniformly scaled SVG; the current-hour marker is an HTML overlay so it
// stays a perfect circle. Hover/tap shows a guide line + temperature tooltip.

import type { HourData } from '@/shared/types/weatherTypes';
import { qsMaybe } from './dom';
import { hourLabel } from './timeLabels';

const SPARK_W = 300;
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

  const temps = hours.map((h) => h.temp_c);
  const min = Math.min(...temps);
  const max = Math.max(...temps);

  sparkHours = hours;
  sparkMin = min;
  sparkRange = max - min || 1;

  const toX = (i: number) => (i / (hours.length - 1)) * SPARK_W;
  const toY = (t: number) => sparkFracY(t) * SPARK_H;

  const points = hours.map((h, i) => `${toX(i).toFixed(1)},${toY(h.temp_c).toFixed(1)}`).join(' ');
  const polyPoints = `${points} ${SPARK_W},${SPARK_H} 0,${SPARK_H}`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,200,60,0.18)"/>
        <stop offset="100%" stop-color="rgba(255,200,60,0)"/>
      </linearGradient>
    </defs>
    <polygon points="${polyPoints}" fill="url(#sparkGrad)"/>
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
