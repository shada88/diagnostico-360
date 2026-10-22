export const tokens = {
  severity: {
    critical:  'var(--critico-fg)',
    warning:   'var(--riesgo-fg)',
    attention: 'var(--estable)',
    good:      'var(--excelente-fg)',
  },
  alert: {
    error:   'var(--alert-critical-fg)',
    warn:    'var(--alert-warning-fg)',
    success: 'var(--alert-success-fg)',
    info:    'var(--alert-mejora-fg)',
  },
  shadow: {
    tooltip: 'var(--shadow-tooltip)',
  },
  surface: {
    tooltipDivider: 'var(--tooltip-divider)',
  },
} as const;
