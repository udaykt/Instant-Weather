// unitSystem.ts — single source of truth for temperature units. Every
// temperature on screen is re-rendered from one snapshot whenever the unit
// flips, so °C/°F can never disagree across the UI.

import { reducedMotion } from '@/shared/utils/motion';
import { qsMaybe } from './dom';

export type Unit = 'C' | 'F';

export interface UnitSnapshot {
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

export const cToF = (c: number): number => (c * 9) / 5 + 32;

/** Called by the renderer once per fetch with the full set of values. */
export function setUnitSnapshot(snapshot: UnitSnapshot): void {
  unitSnapshot = snapshot;
}

export function getSavedUnit(): Unit {
  return localStorage.getItem('tempUnit') === 'F' ? 'F' : 'C';
}

// Smoothly counts the hero temperature to its target. Reduced-motion users
// get an instant set; NaN/equal values short-circuit so it can never wedge.
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

/** "23°" formatted reading for the active unit — used by tests/util callers. */
export function formatTemperature(
  tempC: number,
  tempF: number,
  unit: Unit = getSavedUnit(),
): string {
  return `${Math.round(unit === 'C' ? tempC : tempF)}°`;
}
