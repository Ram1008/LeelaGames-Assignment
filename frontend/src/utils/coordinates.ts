import { MapId, MAP_CONFIG } from '../types';

export interface HoverCoordinates {
  px: number;
  py: number;
  wx: number;
  wz: number;
}

/**
 * Transforms canvas pixel coordinates (px, py) on a 1024x1024 grid
 * back into in-game world coordinates (x, z).
 */
export function pixelToWorld(px: number, py: number, mapId: MapId): { wx: number; wz: number } {
  const cfg = MAP_CONFIG[mapId];
  const u = px / 1024;
  const v = 1 - py / 1024;
  const wx = Math.round(cfg.origin_x + u * cfg.scale);
  const wz = Math.round(cfg.origin_z + v * cfg.scale);
  return { wx, wz };
}
