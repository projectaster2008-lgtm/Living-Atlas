import { describe, expect, it } from 'vitest';
import { chooseUtilityAction } from '../../src/simulation/characters/utility-ai';

describe('chooseUtilityAction', () => {
  it('selects the highest eligible utility score', () => {
    const selected = chooseUtilityAction([
      { id: 'wander', score: 0.2, eligible: true, priority: 1 },
      { id: 'eat', score: 0.8, eligible: true, priority: 1 },
      { id: 'work', score: 0.9, eligible: false, priority: 2 },
    ]);
    expect(selected?.id).toBe('eat');
  });

  it('uses priority then stable id ordering for exact ties', () => {
    const selected = chooseUtilityAction([
      { id: 'talk', score: 0.7, eligible: true, priority: 1 },
      { id: 'work', score: 0.7, eligible: true, priority: 2 },
      { id: 'rest', score: 0.7, eligible: true, priority: 2 },
    ]);
    expect(selected?.id).toBe('rest');
  });

  it('returns null when no action is eligible', () => {
    expect(chooseUtilityAction([
      { id: 'work', score: 1, eligible: false, priority: 1 },
      { id: 'sleep', score: -1, eligible: true, priority: 1 },
    ])).toBeNull();
  });
});