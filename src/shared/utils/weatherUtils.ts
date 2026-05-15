// weatherUtils.ts

import type { DaytimePhase } from '@/shared/types/weatherTypes';

const dateCache: Record<string, string> = {};

export function formatForecastDate(d: Date): string {
  const key = d.toDateString();
  if (dateCache[key]) return dateCache[key];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const result = `${days[d.getDay()]} ${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  dateCache[key] = result;
  return result;
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => unknown,
  delay: number,
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export const DAYTIME_PHASES: Record<string, DaytimePhase> = {
  middle_of_the_night: {
    name: 'Middle of the Night',
    gradient: 'linear-gradient(to bottom, #000000, #434343)',
    isLight: false,
  },
  early_morning: {
    name: 'Early Morning',
    gradient: 'linear-gradient(to bottom, #232526, #414345)',
    isLight: false,
  },
  dawn: { name: 'Dawn', gradient: 'linear-gradient(to bottom, #f7971e, #ffd200)', isLight: true },
  morning: {
    name: 'Morning',
    gradient: 'linear-gradient(to bottom, #a1c4fd, #c2e9fb)',
    isLight: true,
  },
  late_morning: {
    name: 'Late Morning',
    gradient: 'linear-gradient(to bottom, #fceabb, #f8b500)',
    isLight: true,
  },
  afternoon: {
    name: 'Afternoon',
    gradient: 'linear-gradient(to bottom, #00c6fb, #005bea)',
    isLight: false,
  },
  late_afternoon: {
    name: 'Late Afternoon',
    gradient: 'linear-gradient(to bottom, #f7971e, #ffd200)',
    isLight: true,
  },
  early_evening: {
    name: 'Early Evening',
    gradient: 'linear-gradient(to bottom, #f857a6, #ff5858)',
    isLight: false,
  },
  dusk: { name: 'Dusk', gradient: 'linear-gradient(to bottom, #232526, #414345)', isLight: false },
  evening: {
    name: 'Evening',
    gradient: 'linear-gradient(to bottom, #667db6, #0082c8)',
    isLight: false,
  },
  night: {
    name: 'Night',
    gradient: 'linear-gradient(to bottom, #141e30, #243b55)',
    isLight: false,
  },
  midnight: {
    name: 'Midnight',
    gradient: 'linear-gradient(to bottom, #000428, #004e92)',
    isLight: false,
  },
  default: { name: '', gradient: 'linear-gradient(to bottom, #83a4d4, #b6fbff)', isLight: true },
};

export function getDaytimePhase(hour: number): DaytimePhase {
  if (hour === 0) return DAYTIME_PHASES.midnight;
  if (hour >= 1 && hour <= 2) return DAYTIME_PHASES.middle_of_the_night;
  if (hour > 2 && hour <= 5) return DAYTIME_PHASES.early_morning;
  if (hour > 5 && hour <= 6) return DAYTIME_PHASES.dawn;
  if (hour > 6 && hour <= 9) return DAYTIME_PHASES.morning;
  if (hour > 9 && hour <= 12) return DAYTIME_PHASES.late_morning;
  if (hour > 12 && hour <= 16) return DAYTIME_PHASES.afternoon;
  if (hour > 16 && hour <= 17) return DAYTIME_PHASES.late_afternoon;
  if (hour > 17 && hour <= 18) return DAYTIME_PHASES.early_evening;
  if (hour > 18 && hour <= 19) return DAYTIME_PHASES.dusk;
  if (hour > 19 && hour <= 21) return DAYTIME_PHASES.evening;
  return DAYTIME_PHASES.night;
}
