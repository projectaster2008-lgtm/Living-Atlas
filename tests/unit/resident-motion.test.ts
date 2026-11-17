import { describe, expect, it } from 'vitest';
import { dampResidentCoordinate } from '../../src/rendering/characters/motion';

describe('resident presentation motion', () => {
  it('moves partway toward a new simulation target instead of snapping', () => {
    const next = dampResidentCoordinate(0, 10, 1 / 60);

    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(10);
  });

  it('produces consistent movement over equal elapsed time at different frame rates', () => {
    const advance = (frames: number) => {
      let position = 0;
      for (let frame = 0; frame < frames; frame += 1) {
        position = dampResidentCoordinate(position, 10, 1 / frames);
      }
      return position;
    };

    expect(advance(30)).toBeCloseTo(advance(60), 10);
  });

  it('does not move for invalid or zero frame deltas', () => {
    expect(dampResidentCoordinate(2, 10, 0)).toBe(2);
    expect(dampResidentCoordinate(2, 10, Number.NaN)).toBe(2);
    expect(dampResidentCoordinate(2, 10, -1)).toBe(2);
  });

  it('does not overshoot its target after a long frame', () => {
    expect(dampResidentCoordinate(0, 10, 8)).toBeGreaterThan(0);
    expect(dampResidentCoordinate(0, 10, 8)).toBeLessThan(10);
  });
});
