// timeLabels.ts — formats a WeatherAPI "YYYY-MM-DD HH:MM" timestamp into a
// compact 12-hour label ("3 PM"). Shared by the sparkline and hourly cards.

export function hourLabel(time: string): string {
  const tp = time.split(' ')[1] ?? time;
  const hr = parseInt(tp.split(':')[0], 10);
  if (Number.isNaN(hr)) return '--';
  return hr === 0 ? '12 AM' : hr < 12 ? `${hr} AM` : hr === 12 ? '12 PM' : `${hr - 12} PM`;
}
