import { describe, expect, it } from 'vitest';
import { adjustRelationship } from '../../src/simulation/characters/relationships';

describe('adjustRelationship', () => {
  it('clamps relationship values between zero and one hundred', () => {
    expect(adjustRelationship(98, 5)).toBe(100);
    expect(adjustRelationship(2, -8)).toBe(0);
  });

  it('rejects non-finite values without corrupting the current value', () => {
    expect(adjustRelationship(45, Number.NaN)).toBe(45);
  });
});