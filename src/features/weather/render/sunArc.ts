// sunArc.ts — the sun rides *along* the arc path (not a straight chord) by
// driving it with SVG arc-length, and reveals a matching day-progress trail.

import { reducedMotion } from '@/shared/utils/motion';

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

function bezierPoint(t: number): { x: number; y: number } {
  // Quadratic Bézier P0=(10,100) P1=(100,10) P2=(190,100) — happy-dom fallback.
  return {
    x: (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 100 + t * t * 190,
    y: (1 - t) * (1 - t) * 100 + 2 * (1 - t) * t * 10 + t * t * 100,
  };
}

// prevSunLen lets each update glide from where the dot currently sits.
let prevSunLen = 0;
let sunRaf = 0;

export function renderSunArc(sunriseStr: string, sunsetStr: string, localtime: string): void {
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
