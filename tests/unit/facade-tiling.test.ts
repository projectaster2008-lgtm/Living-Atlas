import { describe, expect, it } from 'vitest';
import { getFacadeUvRepeat } from '../../src/rendering/environment/facade-tiling';

describe('facade texture tiling', () => {
  it('maps a two-metre material tile to the real-world facade dimensions', () => {
    expect(getFacadeUvRepeat(8, 6, 2)).toEqual({ u: 4, v: 3 });
  });

  it('keeps small facade dimensions from magnifying the texture', () => {
    expect(getFacadeUvRepeat(1.2, 1.5, 2)).toEqual({ u: 1, v: 1 });
  });

  it('uses a safe tile size when the provided tile size is invalid', () => {
    expect(getFacadeUvRepeat(8, 6, 0)).toEqual({ u: 4, v: 3 });
    expect(getFacadeUvRepeat(8, 6, Number.NaN)).toEqual({ u: 4, v: 3 });
  });
});
