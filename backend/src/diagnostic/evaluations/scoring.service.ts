import { Injectable } from '@nestjs/common';
import { MaturityLevel } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SubdimensionScores {
  SPIRITUAL:  number; // Sub1: Espiritual          → D1
  PERSONAL:   number; // Sub2: Personal           → D1
  RELATIONAL: number; // Sub3: Relacional         → D1
  PURPOSE:    number; // Sub4: Propósito y Visión → D2
  FINANCIAL:  number; // Sub5: Financiera         → D2
  SALES:      number; // Sub6: Ventas             → D2
  OPERATIONS: number; // Sub7: Operación          → D2
  MARKETING:  number; // Sub8: Marketing          → D2
  LEADERSHIP: number; // Sub9: Liderazgo y Equipo → D3
  PLANNING:   number; // Sub10: Planificación     → D3
}

export interface DimensionScores {
  d1: number; // Promedio(Sub1, Sub2, Sub3)
  d2: number; // Promedio(Sub4, Sub5, Sub6, Sub7, Sub8)
  d3: number; // Promedio(Sub9, Sub10)
  ig: number; // Índice Global: Promedio(D1, D2, D3)
}

export interface CrossAlerts {
  alertGlassCeiling:    boolean; // Regla 1: D1<=5 AND D2>=7
  alertLeakyBucket:     boolean; // Regla 2: Sub6>=7 AND Sub5<=5
  alertSuccessCollapse: boolean; // Regla 3: Sub8>=7 AND Sub7<=5
  alertSelfEmployed:    boolean; // Regla 4: Sub7>=7 AND Sub9<=5
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class ScoringService {
  // ---------------------------------------------------------------------------
  // Primitives
  // ---------------------------------------------------------------------------

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  average(values: number[]): number {
    if (values.length === 0) return 0;
    return this.round2(values.reduce((acc, v) => acc + v, 0) / values.length);
  }

  // ---------------------------------------------------------------------------
  // Escala de Madurez (escala 1-10)
  // ---------------------------------------------------------------------------

  classifyMaturity(score: number): MaturityLevel {
    if (score >= 10)  return MaturityLevel.EXCELENTE;
    if (score >= 8)   return MaturityLevel.COMPETENTE;
    if (score >= 6)   return MaturityLevel.ESTABLE;
    if (score >= 4)   return MaturityLevel.RIESGO;
    return MaturityLevel.CRITICO;
  }

  // ---------------------------------------------------------------------------
  // Subdimension computation
  // Groups answers by their subdimension and returns the average per group.
  // ---------------------------------------------------------------------------

  computeSubdimensions(
    answers: { value: number; question: { subdimension: string } }[],
  ): SubdimensionScores {
    const groups: Record<string, number[]> = {
      SPIRITUAL: [], PERSONAL: [], RELATIONAL: [],
      PURPOSE: [], FINANCIAL: [], SALES: [], OPERATIONS: [], MARKETING: [],
      LEADERSHIP: [], PLANNING: [],
    };

    for (const ans of answers) {
      const sub = ans.question.subdimension;
      if (groups[sub] !== undefined) groups[sub].push(ans.value);
    }

    return {
      SPIRITUAL:  this.average(groups.SPIRITUAL),
      PERSONAL:   this.average(groups.PERSONAL),
      RELATIONAL: this.average(groups.RELATIONAL),
      PURPOSE:    this.average(groups.PURPOSE),
      FINANCIAL:  this.average(groups.FINANCIAL),
      SALES:      this.average(groups.SALES),
      OPERATIONS: this.average(groups.OPERATIONS),
      MARKETING:  this.average(groups.MARKETING),
      LEADERSHIP: this.average(groups.LEADERSHIP),
      PLANNING:   this.average(groups.PLANNING),
    };
  }

  // ---------------------------------------------------------------------------
  // Dimension computation
  // ---------------------------------------------------------------------------

  computeDimensions(sub: SubdimensionScores): DimensionScores {
    const d1 = this.average([sub.SPIRITUAL, sub.PERSONAL, sub.RELATIONAL]);
    const d2 = this.average([sub.PURPOSE, sub.FINANCIAL, sub.SALES, sub.OPERATIONS, sub.MARKETING]);
    const d3 = this.average([sub.LEADERSHIP, sub.PLANNING]);
    const ig = this.average([d1, d2, d3]);
    return { d1, d2, d3, ig };
  }

  // ---------------------------------------------------------------------------
  // Motor de Inferencia Cruzada
  // Reglas documentadas en docs/DOMAIN.md — Motor de Inferencia Cruzada
  // ---------------------------------------------------------------------------

  computeCrossAlerts(sub: SubdimensionScores, dim: DimensionScores): CrossAlerts {
    return {
      // Regla 1: "El Techo de Cristal" — D1 <= 5 AND D2 >= 7
      alertGlassCeiling:    dim.d1 <= 5.0 && dim.d2 >= 7.0,
      // Regla 2: "El Cubo Agujereado" — Sub6(Ventas) >= 7 AND Sub5(Financiera) <= 5
      alertLeakyBucket:     sub.SALES >= 7.0 && sub.FINANCIAL <= 5.0,
      // Regla 3: "Riesgo de Colapso por Éxito" — Sub8(Mkt) >= 7 AND Sub7(Ops) <= 5
      alertSuccessCollapse: sub.MARKETING >= 7.0 && sub.OPERATIONS <= 5.0,
      // Regla 4: "Síndrome del Autoempleado" — Sub7(Ops) >= 7 AND Sub9(Liderazgo) <= 5
      alertSelfEmployed:    sub.OPERATIONS >= 7.0 && sub.LEADERSHIP <= 5.0,
    };
  }
}
