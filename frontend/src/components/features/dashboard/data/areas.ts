// ─────────────────────────────────────────────────────────────────────────────
// 10 Áreas Estratégicas — fuente única para la vista del cliente
// Aligned con backend/src/diagnostic/evaluations/constants.ts (SUB_LABELS)
// ─────────────────────────────────────────────────────────────────────────────

import type { ComponentType } from 'react';
import {
  Sparkles, Heart, Users, Target, DollarSign,
  ShoppingBag, Settings, Megaphone, Crown, Map,
} from 'lucide-react';

export type AreaKey =
  | 'SPIRITUAL' | 'PERSONAL' | 'RELATIONAL'
  | 'PURPOSE'   | 'FINANCIAL' | 'SALES' | 'OPERATIONS' | 'MARKETING'
  | 'LEADERSHIP' | 'PLANNING';

type LucideIcon = ComponentType<{ size?: number; className?: string }>;

export interface AreaMeta {
  key: AreaKey;
  label: string;
  shortDescription: string; // 1 línea — qué evalúa
  Icon: LucideIcon;
}

export const AREAS_META: Record<AreaKey, AreaMeta> = {
  SPIRITUAL:  { key: 'SPIRITUAL',  label: 'Espiritual',                 shortDescription: 'Tu conexión con propósito y trascendencia.',           Icon: Sparkles   },
  PERSONAL:   { key: 'PERSONAL',   label: 'Personal',                   shortDescription: 'Tu bienestar emocional y autocuidado.',                Icon: Heart      },
  RELATIONAL: { key: 'RELATIONAL', label: 'Relacional',                 shortDescription: 'La calidad de tus vínculos cercanos.',                 Icon: Users      },
  PURPOSE:    { key: 'PURPOSE',    label: 'Propósito y Visión',         shortDescription: 'La claridad estratégica de tu negocio.',               Icon: Target     },
  FINANCIAL:  { key: 'FINANCIAL',  label: 'Financiera',                 shortDescription: 'La salud económica de tu negocio.',                    Icon: DollarSign },
  SALES:      { key: 'SALES',      label: 'Ventas',                     shortDescription: 'Tu capacidad de generar ingresos sostenidos.',         Icon: ShoppingBag},
  OPERATIONS: { key: 'OPERATIONS', label: 'Operación',                  shortDescription: 'La eficiencia de tus procesos internos.',              Icon: Settings   },
  MARKETING:  { key: 'MARKETING',  label: 'Marketing',                  shortDescription: 'Tu presencia, marca y posicionamiento.',               Icon: Megaphone  },
  LEADERSHIP: { key: 'LEADERSHIP', label: 'Liderazgo y Equipo',         shortDescription: 'Tu capacidad de liderar y desarrollar gente.',         Icon: Crown      },
  PLANNING:   { key: 'PLANNING',   label: 'Planificación y Crecimiento', shortDescription: 'Tu visión de futuro y capacidad de escalar.',         Icon: Map        },
};

// Orden canónico de presentación al cliente
export const AREA_ORDER: AreaKey[] = [
  'SPIRITUAL', 'PERSONAL', 'RELATIONAL',
  'PURPOSE', 'FINANCIAL', 'SALES', 'OPERATIONS', 'MARKETING',
  'LEADERSHIP', 'PLANNING',
];

export const AREAS_ORDERED: AreaMeta[] = AREA_ORDER.map(k => AREAS_META[k]);

/**
 * Resuelve metadata por label (caso radar/backend que envía label en español).
 * Útil cuando RadarPoint solo trae { label, score, maturity }.
 */
export function getAreaByLabel(label: string): AreaMeta | undefined {
  return AREAS_ORDERED.find(a => a.label === label);
}
