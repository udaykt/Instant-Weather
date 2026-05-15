import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatForecastDate,
  debounce,
  getDaytimePhase,
  DAYTIME_PHASES,
} from '../src/shared/utils/weatherUtils';

// ── formatForecastDate ───────────────────────────────────────────────────────
describe('formatForecastDate', () => {
  it('formats a Friday correctly', () => {
    expect(formatForecastDate(new Date('2024-03-15'))).toBe('Friday 15 March 2024');
  });

  it('zero-pads single-digit dates', () => {
    expect(formatForecastDate(new Date('2024-01-05'))).toContain('05 January');
  });

  it('returns the same cached string on repeated calls', () => {
    const d = new Date('2025-06-01');
    expect(formatForecastDate(d)).toBe(formatForecastDate(d));
  });
});

// ── debounce ─────────────────────────────────────────────────────────────────
describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays invocation until after the wait period', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('a');
    debounced('b');
    debounced('c');

    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('fires again after another full delay', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    vi.advanceTimersByTime(200);
    debounced();
    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});

// ── getDaytimePhase ──────────────────────────────────────────────────────────
describe('getDaytimePhase', () => {
  it('maps hour 0 to midnight', () => {
    expect(getDaytimePhase(0)).toBe(DAYTIME_PHASES.midnight);
  });

  it('maps hour 1 to middle_of_the_night', () => {
    expect(getDaytimePhase(1)).toBe(DAYTIME_PHASES.middle_of_the_night);
  });

  it('maps hour 6 to dawn', () => {
    expect(getDaytimePhase(6)).toBe(DAYTIME_PHASES.dawn);
  });

  it('maps hour 8 to morning', () => {
    expect(getDaytimePhase(8)).toBe(DAYTIME_PHASES.morning);
  });

  it('maps hour 14 to afternoon', () => {
    expect(getDaytimePhase(14)).toBe(DAYTIME_PHASES.afternoon);
  });

  it('maps hour 18 to early_evening', () => {
    expect(getDaytimePhase(18)).toBe(DAYTIME_PHASES.early_evening);
  });

  it('maps hour 22 to night', () => {
    expect(getDaytimePhase(22)).toBe(DAYTIME_PHASES.night);
  });

  it('every entry has gradient, name, and isLight properties', () => {
    for (const [key, val] of Object.entries(DAYTIME_PHASES)) {
      expect(val, `${key} missing gradient`).toHaveProperty('gradient');
      expect(val, `${key} missing isLight`).toHaveProperty('isLight');
      expect(val, `${key} missing name`).toHaveProperty('name');
    }
  });
});
