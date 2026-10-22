import type { DimensionResult } from '@/domain/maturity/types';

export function weakestSub(dim: DimensionResult): { label: string; score: number } {
  const sorted = [...dim.subdimensions].sort((a, b) => a.score - b.score);
  return sorted[0] ?? { label: dim.label, score: dim.score };
}
