export const SUB_LABELS: Record<string, string> = {
  SPIRITUAL:  'Espiritual',
  PERSONAL:   'Personal',
  RELATIONAL: 'Relacional',
  PURPOSE:    'Propósito y Visión',
  FINANCIAL:  'Financiera',
  SALES:      'Ventas',
  OPERATIONS: 'Operación',
  MARKETING:  'Marketing',
  LEADERSHIP: 'Liderazgo y Equipo',
  PLANNING:   'Planificación y Crecimiento',
};

export const DIMENSION_SUBS: Record<string, string[]> = {
  INTERNAL: ['SPIRITUAL', 'PERSONAL', 'RELATIONAL'],
  BUSINESS: ['PURPOSE', 'FINANCIAL', 'SALES', 'OPERATIONS', 'MARKETING'],
  GROWTH:   ['LEADERSHIP', 'PLANNING'],
};

export const DIMENSION_LABELS: Record<string, string> = {
  INTERNAL: 'Área Interna',
  BUSINESS: 'Área del Negocio',
  GROWTH:   'Área de Crecimiento',
};
