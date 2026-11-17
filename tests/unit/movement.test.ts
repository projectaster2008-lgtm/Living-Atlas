import { describe, expect, it } from 'vitest';
import { getMovementVector } from '../../src/gameplay/player/movement';

describe('player movement vector', () => {
  it('returns a zero vector when no movement key is pressed', () => {
    expect(getMovementVector({})).toEqual({ x: 0, z: 0 });
  });

  it('maps WASD to the expected world-relative direction', () => {
    expect(getMovementVector({ KeyW: true })).toEqual({ x: 0, z: -1 });
    expect(getMovementVector({ KeyA: true })).toEqual({ x: -1, z: 0 });
  });

  it('normalizes diagonal movement to prevent faster diagonal speed', () => {
    const vector = getMovementVector({ KeyW: true, KeyD: true });
    expect(Math.hypot(vector.x, vector.z)).toBeCloseTo(1, 8);
    expect(vector.x).toBeCloseTo(Math.SQRT1_2, 8);
    expect(vector.z).toBeCloseTo(-Math.SQRT1_2, 8);
  });

  it('writes into a reusable output vector when provided', () => {
    const output = { x: 9, z: 9 };
    const result = getMovementVector({ KeyW: true, KeyD: true }, output);

    expect(result).toBe(output);
    expect(output.x).toBeCloseTo(Math.SQRT1_2, 8);
    expect(output.z).toBeCloseTo(-Math.SQRT1_2, 8);
  });

  it('cancels opposing directions', () => {
    expect(getMovementVector({ KeyW: true, KeyS: true })).toEqual({ x: 0, z: 0 });
  });
});