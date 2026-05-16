// motion.ts — single source of truth for the user's reduced-motion preference.

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
