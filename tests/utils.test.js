import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dateBuilder, debounce, getTimeOfDay, TIMES_OF_DAY } from '../utils.js';

// ── dateBuilder ──────────────────────────────────────────────────────────────
describe('dateBuilder', () => {
  it('formats a Friday correctly', () => {
    expect(dateBuilder(new Date('2024-03-15'))).toBe('Friday 15 March 2024');
  });

  it('zero-pads single-digit dates', () => {
    expect(dateBuilder(new Date('2024-01-05'))).toContain('05 January');
  });

  it('returns the same cached string on repeated calls', () => {
    const d = new Date('2025-06-01');
    expect(dateBuilder(d)).toBe(dateBuilder(d));
  });
});

// ── debounce ─────────────────────────────────────────────────────────────────
describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

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

// ── getTimeOfDay ─────────────────────────────────────────────────────────────
describe('getTimeOfDay', () => {
  it('maps hour 0 to midnight', () => {
    expect(getTimeOfDay(0)).toBe(TIMES_OF_DAY.midnight);
  });

  it('maps hour 1 to middle_of_the_night', () => {
    expect(getTimeOfDay(1)).toBe(TIMES_OF_DAY.middle_of_the_night);
  });

  it('maps hour 6 to dawn', () => {
    expect(getTimeOfDay(6)).toBe(TIMES_OF_DAY.dawn);
  });

  it('maps hour 8 to morning', () => {
    expect(getTimeOfDay(8)).toBe(TIMES_OF_DAY.morning);
  });

  it('maps hour 14 to afternoon', () => {
    expect(getTimeOfDay(14)).toBe(TIMES_OF_DAY.afternoon);
  });

  it('maps hour 18 to early_evening', () => {
    expect(getTimeOfDay(18)).toBe(TIMES_OF_DAY.early_evening);
  });

  it('maps hour 22 to night', () => {
    expect(getTimeOfDay(22)).toBe(TIMES_OF_DAY.night);
  });

  it('every time-of-day entry has gradient and name properties', () => {
    for (const [key, val] of Object.entries(TIMES_OF_DAY)) {
      expect(val, `${key} missing gradient`).toHaveProperty('gradient');
      expect(val, `${key} missing isLight`).toHaveProperty('isLight');
    }
  });
});
