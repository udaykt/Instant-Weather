// dom.ts — tiny typed query helpers shared by every render module.

/** Query a required element. Throws if missing (use for must-exist nodes). */
export function qs<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: "${selector}"`);
  return el;
}

/** Query an optional element. Returns null instead of throwing. */
export function qsMaybe<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}
