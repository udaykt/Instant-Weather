// glassHover.ts — cursor-tracking glass light glow + aurora parallax depth

export function initGlassHover(): void {
  // Small cards: tight 70px glow spot that follows cursor precisely
  document
    .querySelectorAll<HTMLElement>('.stat-tile, .quick-city-card, .forecast-card')
    .forEach((el) => {
      el.addEventListener('mousemove', (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--gx', `${e.clientX - r.left}px`);
        el.style.setProperty('--gy', `${e.clientY - r.top}px`);
      });
      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--gx', '-200px');
        el.style.setProperty('--gy', '-200px');
      });
    });

  // Panels: wide 280px ambient glow that drifts across the whole panel
  document.querySelectorAll<HTMLElement>('.sidebar, .stats-rail, .main-panel').forEach((panel) => {
    panel.addEventListener('mousemove', (e: MouseEvent) => {
      const r = panel.getBoundingClientRect();
      panel.style.setProperty('--gx', `${e.clientX - r.left}px`);
      panel.style.setProperty('--gy', `${e.clientY - r.top}px`);
    });
    panel.addEventListener('mouseleave', () => {
      panel.style.setProperty('--gx', '-500px');
      panel.style.setProperty('--gy', '-500px');
    });
  });

  // Aurora parallax: two blobs move at different speeds for layered depth
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let rafId = 0;
  document.addEventListener('mousemove', (e: MouseEvent) => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      document.documentElement.style.setProperty('--aurora-x', `${dx}px`);
      document.documentElement.style.setProperty('--aurora-y', `${dy}px`);
    });
  });
}
