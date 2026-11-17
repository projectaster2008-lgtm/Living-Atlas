export interface TouchMovement {
  x: number;
  z: number;
}

export function normalizeTouchMovement(x: number, y: number, deadZone = 0.12): TouchMovement {
  const magnitude = Math.hypot(x, y);
  if (!Number.isFinite(magnitude) || magnitude <= deadZone) return { x: 0, z: 0 };
  const scale = Math.min(1, magnitude) / magnitude;
  return { x: x * scale, z: y * scale };
}
