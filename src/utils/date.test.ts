import { describe, expect, it } from 'vitest';

import { addDays, addMinutes, addSeconds, formatISO, isExpired, now } from '@/utils/date.js';

const BASE = new Date('2026-07-07T12:00:00.000Z');

describe('addMinutes', () => {
  it('adds minutes without mutating the input', () => {
    expect(addMinutes(BASE, 30).toISOString()).toBe('2026-07-07T12:30:00.000Z');
    expect(BASE.toISOString()).toBe('2026-07-07T12:00:00.000Z');
  });
});

describe('addSeconds', () => {
  it('adds seconds', () => {
    expect(addSeconds(BASE, 90).toISOString()).toBe('2026-07-07T12:01:30.000Z');
  });
});

describe('addDays', () => {
  it('adds days', () => {
    expect(addDays(BASE, 2).toISOString()).toBe('2026-07-09T12:00:00.000Z');
  });
});

describe('isExpired', () => {
  it('returns true for a past date', () => {
    expect(isExpired(new Date(Date.now() - 60_000))).toBe(true);
  });

  it('returns false for a future date', () => {
    expect(isExpired(new Date(Date.now() + 60_000))).toBe(false);
  });
});

describe('now', () => {
  it('returns a Date close to the current instant', () => {
    expect(Math.abs(now().getTime() - Date.now())).toBeLessThan(1_000);
  });
});

describe('formatISO', () => {
  it('serialises to an ISO 8601 string', () => {
    expect(formatISO(BASE)).toBe('2026-07-07T12:00:00.000Z');
  });
});
