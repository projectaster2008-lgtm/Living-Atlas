import { describe, expect, it } from 'vitest';
import { advanceClock, createClock } from '../../src/simulation/core/clock';

describe('simulation clock', () => {
  it('advances at the configured time scale and rolls over days', () => {
    const start = createClock(86_390);
    const next = advanceClock(start, 1, 30, 1);
    expect(next.secondsOfDay).toBe(20);
    expect(next.day).toBe(2);
  });

  it('clamps long frame stalls instead of skipping large amounts of world time', () => {
    const start = createClock(12_000);
    const next = advanceClock(start, 30, 60, 0.1);
    expect(next.secondsOfDay - start.secondsOfDay).toBe(6);
  });

  it('does not advance for negative or non-finite frame deltas', () => {
    const start = createClock(12_000);
    expect(advanceClock(start, -2, 60)).toEqual(start);
    expect(advanceClock(start, Number.NaN, 60)).toEqual(start);
  });
});