import { describe, expect, it } from 'vitest';
import { createSeededRandom } from '../../src/simulation/core/random';

describe('createSeededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const first = createSeededRandom(42);
    const second = createSeededRandom(42);
    expect(Array.from({ length: 8 }, first)).toEqual(Array.from({ length: 8 }, second));
  });

  it('returns values in the half-open interval [0, 1)', () => {
    const random = createSeededRandom(90210);
    for (let index = 0; index < 1000; index += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});