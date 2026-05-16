// bestTimeAdvisor.ts — find the best consecutive window for outdoor activity today

import type { HourData } from '@/shared/types/weatherTypes';

function scoreHour(h: HourData): number {
  let score = 0;
  if (h.chance_of_rain < 20) score += 2;
  if (h.uv < 5) score += 2;
  if (h.temp_c >= 18 && h.temp_c <= 30) score += 1;
  if (h.wind_kph < 25) score += 1;
  return score;
}

function hourLabel(timeStr: string): string {
  // timeStr: "2026-05-15 14:00"
  const parts = timeStr.split(' ');
  const timePart = parts[1] ?? timeStr;
  const h = parseInt(timePart.split(':')[0], 10);
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

export function getBestOutdoorWindow(hours: HourData[]): string {
  // Only consider 6am–9pm
  const dayHours = hours.filter((h) => {
    const parts = h.time.split(' ');
    const timePart = parts[1] ?? h.time;
    const hr = parseInt(timePart.split(':')[0], 10);
    return hr >= 6 && hr <= 21;
  });

  if (dayHours.length === 0) return '';

  // Find the best run of consecutive good hours (score >= 3)
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;

  for (let i = 0; i < dayHours.length; i++) {
    if (scoreHour(dayHours[i]) >= 3) {
      if (curLen === 0) curStart = i;
      curLen++;
      if (curLen > bestLen) {
        bestLen = curLen;
        bestStart = curStart;
      }
    } else {
      curLen = 0;
    }
  }

  if (bestLen === 0 || bestStart < 0) return 'No ideal window today';

  const startHour = dayHours[bestStart];
  const endHour = dayHours[bestStart + bestLen - 1];
  const startLabel = hourLabel(startHour.time);
  const endLabel = hourLabel(endHour.time);

  // Build a short description of the window conditions
  const sample = dayHours[bestStart];
  const traits: string[] = [];
  if (sample.temp_c >= 18 && sample.temp_c <= 30) traits.push('mild');
  if (sample.uv < 3) traits.push('low UV');
  else if (sample.uv < 5) traits.push('moderate UV');
  if (sample.chance_of_rain < 10) traits.push('dry');
  if (sample.wind_kph < 15) traits.push('calm');

  const desc = traits.slice(0, 2).join(', ');
  return `Best window: ${startLabel}–${endLabel}${desc ? ` · ${desc}` : ''}`;
}
