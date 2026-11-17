export function adjustRelationship(current: number, delta: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(delta)) {
    return Number.isFinite(current) ? Math.min(100, Math.max(0, current)) : 0;
  }
  return Math.min(100, Math.max(0, current + delta));
}