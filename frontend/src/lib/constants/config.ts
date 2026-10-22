import { tokens } from '@/lib/config/tokens';

export const DASHBOARD_CONFIG = {
  THRESHOLDS: {
    CRITICAL: 40,
    WARNING: 60,
    ATTENTION: 80,
  },
} as const;

export const getStatusColor = (score: number): string => {
  if (score < DASHBOARD_CONFIG.THRESHOLDS.CRITICAL) return tokens.severity.critical;
  if (score < DASHBOARD_CONFIG.THRESHOLDS.WARNING)  return tokens.severity.warning;
  if (score < DASHBOARD_CONFIG.THRESHOLDS.ATTENTION) return tokens.severity.attention;
  return tokens.severity.good;
};
