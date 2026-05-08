// utils.ts

import type { TimeOfDay } from './types';

const dateCache: Record<string, string> = {};

export function dateBuilder(d: Date): string {
  const key = d.toDateString();
  if (dateCache[key]) return dateCache[key];
  const days    = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months  = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
  const result  = `${days[d.getDay()]} ${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
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

export const TIMES_OF_DAY: Record<string, TimeOfDay> = {
  middle_of_the_night: { name: 'Middle of the Night', gradient: 'linear-gradient(to bottom, #000000, #434343)', isLight: false },
  early_morning:       { name: 'Early Morning',        gradient: 'linear-gradient(to bottom, #232526, #414345)', isLight: false },
  dawn:                { name: 'Dawn',                 gradient: 'linear-gradient(to bottom, #f7971e, #ffd200)', isLight: true  },
  morning:             { name: 'Morning',              gradient: 'linear-gradient(to bottom, #a1c4fd, #c2e9fb)', isLight: true  },
  late_morning:        { name: 'Late Morning',         gradient: 'linear-gradient(to bottom, #fceabb, #f8b500)', isLight: true  },
  afternoon:           { name: 'Afternoon',            gradient: 'linear-gradient(to bottom, #00c6fb, #005bea)', isLight: false },
  late_afternoon:      { name: 'Late Afternoon',       gradient: 'linear-gradient(to bottom, #f7971e, #ffd200)', isLight: true  },
  early_evening:       { name: 'Early Evening',        gradient: 'linear-gradient(to bottom, #f857a6, #ff5858)', isLight: false },
  dusk:                { name: 'Dusk',                 gradient: 'linear-gradient(to bottom, #232526, #414345)', isLight: false },
  evening:             { name: 'Evening',              gradient: 'linear-gradient(to bottom, #667db6, #0082c8)', isLight: false },
  night:               { name: 'Night',                gradient: 'linear-gradient(to bottom, #141e30, #243b55)', isLight: false },
  midnight:            { name: 'Midnight',             gradient: 'linear-gradient(to bottom, #000428, #004e92)', isLight: false },
  default:             { name: '',                     gradient: 'linear-gradient(to bottom, #83a4d4, #b6fbff)', isLight: true  },
};

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour === 0)               return TIMES_OF_DAY.midnight;
  if (hour >= 1  && hour <= 2)  return TIMES_OF_DAY.middle_of_the_night;
  if (hour >  2  && hour <= 5)  return TIMES_OF_DAY.early_morning;
  if (hour >  5  && hour <= 6)  return TIMES_OF_DAY.dawn;
  if (hour >  6  && hour <= 9)  return TIMES_OF_DAY.morning;
  if (hour >  9  && hour <= 12) return TIMES_OF_DAY.late_morning;
  if (hour >  12 && hour <= 16) return TIMES_OF_DAY.afternoon;
  if (hour >  16 && hour <= 17) return TIMES_OF_DAY.late_afternoon;
  if (hour >  17 && hour <= 18) return TIMES_OF_DAY.early_evening;
  if (hour >  18 && hour <= 19) return TIMES_OF_DAY.dusk;
  if (hour >  19 && hour <= 21) return TIMES_OF_DAY.evening;
  return TIMES_OF_DAY.night;
}
