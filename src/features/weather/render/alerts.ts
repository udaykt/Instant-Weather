// alerts.ts — severe-weather banner stack (dismissible).

import type { Alert } from '@/shared/types/weatherTypes';

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
