import type { DimensionResult, SubdimensionResult } from '@/types/dashboard';
import type { GapResult } from './types';
import { GAP_THRESHOLDS } from './types';

export function isSameAsGap(gap: GapResult, keyA: string, keyB: string): boolean {
  const keys = new Set([gap.highSub.key, gap.lowSub.key]);
  return keys.has(keyA) && keys.has(keyB);
}

export function generateGapAnalysis(
  high: SubdimensionResult,
  low: SubdimensionResult,
  value: number,
  isCritical: boolean,
): string {
  if (!isCritical) {
    return `Diferencia de ${value.toFixed(1)} puntos entre tus áreas clave. Tus áreas están relativamente equilibradas.`;
  }
  return `Tu área de ${high.label} (${high.score.toFixed(1)}) supera en ${value.toFixed(1)} pts a tu área de ${low.label} (${low.score.toFixed(1)}). Esta descompensación genera un cuello de botella que frena tu crecimiento general.`;
}

export function calculateGap(dimensions: DimensionResult[]): GapResult {
  const allSubs = dimensions.flatMap(d => d.subdimensions);
  const sorted = [...allSubs].sort((a, b) => b.score - a.score);
  const high = sorted[0];
  const low  = sorted[sorted.length - 1];
  const value = high.score - low.score;
  const isCritical = value >= GAP_THRESHOLDS.CRITICAL;

  return {
    value,
    highSub:    high,
    lowSub:     low,
    isCritical,
    analysis:   generateGapAnalysis(high, low, value, isCritical),
  };
}
