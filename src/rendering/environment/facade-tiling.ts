export type FacadeUvRepeat = { u: number; v: number };

export function getFacadeUvRepeat(
  width: number,
  height: number,
  tileSize = 2,
): FacadeUvRepeat {
  const safeTileSize = Number.isFinite(tileSize) && tileSize > 0 ? tileSize : 2;
  const safeWidth = Number.isFinite(width) && width > 0 ? width : safeTileSize;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : safeTileSize;

  return {
    u: Math.max(1, safeWidth / safeTileSize),
    v: Math.max(1, safeHeight / safeTileSize),
  };
}
