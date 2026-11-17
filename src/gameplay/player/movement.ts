export type MovementKeys = Readonly<Record<string, boolean>>;

export interface MovementVector {
  x: number;
  z: number;
}

export function getMovementVector(
  keys: MovementKeys,
  output: MovementVector = { x: 0, z: 0 },
): MovementVector {
  const horizontal = Number(Boolean(keys.KeyD || keys.ArrowRight))
    - Number(Boolean(keys.KeyA || keys.ArrowLeft));
  const vertical = Number(Boolean(keys.KeyS || keys.ArrowDown))
    - Number(Boolean(keys.KeyW || keys.ArrowUp));
  const magnitude = Math.hypot(horizontal, vertical);

  if (magnitude === 0) {
    output.x = 0;
    output.z = 0;
    return output;
  }

  output.x = horizontal / magnitude;
  output.z = vertical / magnitude;
  return output;
}