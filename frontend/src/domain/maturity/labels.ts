import type { DimensionKey } from './types';

export const SUB_LABELS: Record<string, string> = {
  SPIRITUAL:       'Espiritual',
  PERSONAL:        'Personal',
  RELATIONAL:      'Relacional',
  PURPOSE_VISION:  'Propósito y Visión',
  FINANCIAL:       'Financiera',
  SALES:           'Ventas',
  OPERATIONS:      'Operación',
  MARKETING:       'Marketing',
  LEADERSHIP_TEAM: 'Liderazgo y Equipo',
  PLANNING_GROWTH: 'Planificación y Crecimiento',
};

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  INTERNAL: 'Área Interna',
  BUSINESS: 'Área del Negocio',
  GROWTH:   'Área de Crecimiento',
};

export const DIMENSION_SHORT_LABELS: Record<DimensionKey, string> = {
  INTERNAL: 'Interna',
  BUSINESS: 'Negocio',
  GROWTH:   'Crecimiento',
};

export const DIMENSION_AREA_MAP: Record<DimensionKey, string[]> = {
  INTERNAL: ['Espiritual', 'Personal', 'Relacional'],
  BUSINESS: ['Propósito y Visión', 'Financiera', 'Ventas', 'Operación', 'Marketing'],
  GROWTH:   ['Liderazgo y Equipo', 'Planificación y Crecimiento'],
};

export const DIMENSION_COLORS: Record<DimensionKey, string> = {
  INTERNAL: '#C9A84C',
  BUSINESS: '#D4853A',
  GROWTH:   '#5BA87A',
};
