import type { DimensionResult, SubdimensionResult } from '@/types/dashboard';

export interface Brecha {
  id:      number;
  title:   string;
  insight: string;
  color:   string;
}

export interface GapResult {
  value:      number;
  highSub:    SubdimensionResult;
  lowSub:     SubdimensionResult;
  isCritical: boolean;
  analysis:   string;
}

export const GAP_THRESHOLDS = {
  HIGH:      7.0,
  LOW:       6.0,
  EXCELLENT: 8.0,
  GAP:       2.5,
  CRITICAL:  2.5,
} as const;
