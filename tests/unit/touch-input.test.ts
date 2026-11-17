import { describe, expect, it } from 'vitest';
import { normalizeTouchMovement } from '../../src/gameplay/player/touch-input';

describe('normalizeTouchMovement', () => {
  it('returns a neutral vector inside the dead zone', () => {
    expect(normalizeTouchMovement(0.05, -0.05)).toEqual({ x: 0, z: 0 });
  });

  it('preserves analog input below full deflection', () => {
    expect(normalizeTouchMovement(0.5, 0)).toEqual({ x: 0.5, z: 0 });
  });

  it('clamps full deflection to a unit vector', () => {
    expect(normalizeTouchMovement(2, 0)).toEqual({ x: 1, z: 0 });
  });

  it('normalizes diagonal movement to prevent faster diagonal travel', () => {
    const result = normalizeTouchMovement(1, 1);
    expect(Math.hypot(result.x, result.z)).toBeCloseTo(1, 6);
  });

  it('rejects non-finite input safely', () => {
    expect(normalizeTouchMovement(Number.NaN, Number.POSITIVE_INFINITY)).toEqual({ x: 0, z: 0 });
  });
});
