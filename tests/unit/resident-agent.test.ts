import { describe, expect, it } from 'vitest';
import { advanceResident, createResident } from '../../src/simulation/characters/resident-agent';

describe('resident game AI', () => {
  it('creates repeatable residents from a stable seed', () => {
    const first = createResident('mara', 'Mara', 17);
    const second = createResident('mara', 'Mara', 17);
    expect(first).toEqual(second);
  });

  it('moves residents toward destinations without overshooting', () => {
    const resident = createResident('mara', 'Mara', 17);
    const next = advanceResident({ ...resident, x: 0, z: 0, targetX: 1, targetZ: 0 }, 20, 'clear', 10);
    expect(next.x).toBeCloseTo(1, 5);
    expect(next.z).toBe(0);
  });

  it('uses a shelter action during heavy rain', () => {
    const resident = createResident('eli', 'Eli', 8);
    const next = advanceResident({ ...resident, decisionIn: 0 }, 0.1, 'storm', 12);
    expect(next.action).toBe('shelter');
  });
});