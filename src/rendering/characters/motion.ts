import { clampDelta } from '../../simulation/core/random';

export function dampResidentCoordinate(
  current: number,
  target: number,
  deltaSeconds: number,
  responsiveness = 14,
): number {
  const delta = clampDelta(deltaSeconds, 0.1);
  const rate = Number.isFinite(responsiveness) ? Math.max(0, responsiveness) : 14;
  const alpha = 1 - Math.exp(-rate * delta);
  return current + (target - current) * alpha;
}
