import type { DimensionKey } from './types';
import { DIMENSION_AREA_MAP, DIMENSION_COLORS } from './labels';

export function getAreaDimensionColor(areaLabel: string): string {
  for (const [dimKey, areas] of Object.entries(DIMENSION_AREA_MAP)) {
    if (areas.includes(areaLabel)) return DIMENSION_COLORS[dimKey as DimensionKey];
  }
  return 'var(--gold)';
}

export function getDimensionForArea(areaLabel: string): DimensionKey | null {
  for (const [dimKey, areas] of Object.entries(DIMENSION_AREA_MAP)) {
    if (areas.includes(areaLabel)) return dimKey as DimensionKey;
  }
  return null;
}
