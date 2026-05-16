// weatherIcon.ts — hero condition icon. Plain crisp PNG from the WeatherAPI
// CDN (no animation runtime). Upgrades 64px → 128px so it stays sharp at the
// 132px hero size, and reveals the image only once real data arrives (the
// static placeholder ships hidden so no default-sunny icon flashes on load).

import { qsMaybe } from './dom';

export function setWeatherIcon(iconSrc: string, iconAlt: string): void {
  const img = qsMaybe<HTMLImageElement>('#icon');
  if (!img) return;
  img.src = iconSrc.replace('/64x64/', '/128x128/');
  img.alt = iconAlt;
  img.hidden = false;
}

/** Build a crisp icon URL from a WeatherAPI protocol-relative icon path. */
export function iconUrl(conditionIcon: string): string {
  return `https:${conditionIcon}`.replace('/64x64/', '/128x128/');
}
