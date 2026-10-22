import { Injectable } from '@nestjs/common';
import { MaturityLevel } from '@prisma/client';
import { AnalyticalMode, MaturityMeta, CrossAlert } from './dto/dashboard.dto';

// ─────────────────────────────────────────────────────────────────────────────
// METADATA TABLES
// ─────────────────────────────────────────────────────────────────────────────

const MATURITY_META: Record<MaturityLevel, Omit<MaturityMeta, 'level'>> = {
  [MaturityLevel.CRITICO]: {
    label:       'Crítico',
    color:       '#8B1A1A',
    description: 'Alerta Roja. Intervención inmediata requerida.',
  },
  [MaturityLevel.RIESGO]: {
    label:       'Riesgo',
    color:       '#C65D00',
    description: 'Área inestable. Se necesita un plan de corrección a corto plazo.',
  },
  [MaturityLevel.ESTABLE]: {
    label:       'Estable',
    color:       '#8B7500',
    description: 'Funciona, pero hay estancamiento. Zona de confort peligrosa.',
  },
  [MaturityLevel.COMPETENTE]: {
    label:       'Competente',
    color:       '#B8860B',
    description: 'Buen desempeño. Base sólida para iniciar escalabilidad.',
  },
  [MaturityLevel.EXCELENTE]: {
    label:       'Excelente',
    color:       '#FFD700',
    description: 'Fortaleza clave. Modelo a replicar en otras áreas.',
  },
};

// Cross-inference alert definitions
// Reglas documentadas en docs/DOMAIN.md — Motor de Inferencia Cruzada
const ALERT_DEFINITIONS: Record<string, Omit<CrossAlert, 'key'>> = {
  GLASS_CEILING: {
    title:    'El Techo de Cristal',
    message:  'Tu negocio está creciendo más rápido que tu estabilidad personal. Sin orden y disciplina propios, ninguna estrategia comercial se sostiene en el tiempo.',
    severity: 'HIGH',
  },
  LEAKY_BUCKET: {
    title:    'El Cubo Agujereado',
    message:  'Vendes, pero el dinero no se queda. Antes de buscar más ventas necesitas control sobre tus finanzas.',
    severity: 'HIGH',
  },
  SUCCESS_COLLAPSE: {
    title:    'Riesgo de Colapso por Éxito',
    message:  'Atraes más clientes de los que tu operación puede atender bien. Si no fortaleces tus procesos, la experiencia del cliente y tu reputación se van a resentir.',
    severity: 'HIGH',
  },
  SELF_EMPLOYED: {
    title:    'Síndrome del Autoempleado',
    message:  'Tu operación funciona, pero depende casi por completo de ti. Para crecer necesitas formar a otros y delegar.',
    severity: 'MEDIUM',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class RuleBasedInsightService {
  // ---------------------------------------------------------------------------
  // maturity metadata builder
  // ---------------------------------------------------------------------------

  buildMaturityMeta(level: MaturityLevel): MaturityMeta {
    return { level, ...MATURITY_META[level] };
  }

  // ---------------------------------------------------------------------------
  // Analytical mode (from IG score 1-10)
  // ---------------------------------------------------------------------------

  getAnalyticalMode(ig: number): AnalyticalMode {
    if (ig >= 8) return AnalyticalMode.GROWTH;
    if (ig >= 6) return AnalyticalMode.MAINTENANCE;
    if (ig >= 4) return AnalyticalMode.INTERVENTION;
    return AnalyticalMode.CRISIS;
  }

  // ---------------------------------------------------------------------------
  // Active alerts builder
  // Receives the boolean flags from DiagnosticResult and returns full CrossAlert[]
  // ---------------------------------------------------------------------------

  buildActiveAlerts(flags: {
    alertGlassCeiling:    boolean;
    alertLeakyBucket:     boolean;
    alertSuccessCollapse: boolean;
    alertSelfEmployed:    boolean;
  }): CrossAlert[] {
    const alerts: CrossAlert[] = [];

    if (flags.alertGlassCeiling)
      alerts.push({ key: 'GLASS_CEILING',    ...ALERT_DEFINITIONS.GLASS_CEILING });
    if (flags.alertLeakyBucket)
      alerts.push({ key: 'LEAKY_BUCKET',     ...ALERT_DEFINITIONS.LEAKY_BUCKET });
    if (flags.alertSuccessCollapse)
      alerts.push({ key: 'SUCCESS_COLLAPSE', ...ALERT_DEFINITIONS.SUCCESS_COLLAPSE });
    if (flags.alertSelfEmployed)
      alerts.push({ key: 'SELF_EMPLOYED',    ...ALERT_DEFINITIONS.SELF_EMPLOYED });

    return alerts;
  }
}
