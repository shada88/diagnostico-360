import type { DimensionResult } from '@/domain/maturity/types';
import type { Brecha, GapResult } from './types';
import { GAP_THRESHOLDS } from './types';
import { weakestSub } from './sub-scoring';
import { isSameAsGap } from './gap-calculator';

const COLOR_CRITICAL = 'var(--critico-fg)';
const COLOR_WARNING  = 'var(--riesgo-fg)';
const COLOR_CAUTION  = 'var(--gold)';
const COLOR_SUCCESS  = 'var(--excelente-fg)';

export function detectBrechas(dimensions: DimensionResult[], gap: GapResult): Brecha[] {
  const internal = dimensions.find(d => d.key === 'INTERNAL');
  const business = dimensions.find(d => d.key === 'BUSINESS');
  const growth   = dimensions.find(d => d.key === 'GROWTH');

  const d1 = internal?.score ?? 5;
  const d2 = business?.score ?? 5;
  const d3 = growth?.score  ?? 5;

  const { HIGH, LOW, EXCELLENT, GAP } = GAP_THRESHOLDS;

  const detected: Brecha[] = [];
  const scores = [d1, d2, d3];

  if (d2 >= HIGH && d1 <= LOW && internal && business) {
    const weak = weakestSub(internal);
    const alreadyCovered = isSameAsGap(gap, 'BUSINESS', 'INTERNAL');
    const insight = alreadyCovered
      ? `El punto más crítico es ${weak.label} (${weak.score.toFixed(1)}). Mientras tu negocio opera, tu base personal se desgasta sin que lo notes — eso es lo que frena el crecimiento sostenible.`
      : `Tu ${business.label} (${d2.toFixed(1)}) supera ampliamente a tu ${internal.label} (${d1.toFixed(1)}). Lo más afectado: ${weak.label} (${weak.score.toFixed(1)}). Tu negocio avanza, pero tu estabilidad personal no acompaña ese ritmo.`;
    detected.push({ id: 1, title: 'Interna vs. Negocio', insight, color: COLOR_CRITICAL });
  }

  if (d2 >= HIGH && d3 <= LOW && growth && business) {
    const weak = weakestSub(growth);
    const alreadyCovered = isSameAsGap(gap, 'BUSINESS', 'GROWTH');
    const insight = alreadyCovered
      ? `El área más rezagada es ${weak.label} (${weak.score.toFixed(1)}). El negocio está operativo, pero sin liderazgo ni planificación, no hay camino para escalar.`
      : `Tu ${business.label} (${d2.toFixed(1)}) contrasta con tu ${growth.label} (${d3.toFixed(1)}). ${weak.label} (${weak.score.toFixed(1)}) es el cuello de botella. El negocio funciona, pero no tiene tracción para crecer.`;
    detected.push({ id: 2, title: 'Negocio vs. Crecimiento', insight, color: COLOR_WARNING });
  }

  if (d3 >= HIGH && d1 <= LOW && internal && growth) {
    const weak = weakestSub(internal);
    const alreadyCovered = isSameAsGap(gap, 'GROWTH', 'INTERNAL');
    const insight = alreadyCovered
      ? `La ambición de crecer existe, pero ${weak.label} (${weak.score.toFixed(1)}) es el límite real. Sin esa base, cada intento de escalar genera desgaste.`
      : `Tu ${growth.label} (${d3.toFixed(1)}) está muy por encima de tu ${internal.label} (${d1.toFixed(1)}). ${weak.label} (${weak.score.toFixed(1)}) es el freno. Quieres escalar, pero tu base interna todavía no lo soporta.`;
    detected.push({ id: 3, title: 'Interna vs. Crecimiento', insight, color: COLOR_CRITICAL });
  }

  if (detected.length === 0) {
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    if (maxScore - minScore >= GAP) {
      const highDim = dimensions.find(d => d.score === maxScore)!;
      const lowDim  = dimensions.find(d => d.score === minScore)!;
      const weak = weakestSub(lowDim);
      const alreadyCovered = isSameAsGap(gap, highDim.key, lowDim.key);
      const insight = alreadyCovered
        ? `Dentro de ${lowDim.label}, ${weak.label} (${weak.score.toFixed(1)}) es el área que más jala hacia abajo. Esa fortaleza en ${highDim.label} pierde valor si no hay equilibrio.`
        : `Tu ${highDim.label} (${maxScore.toFixed(1)}) supera por ${(maxScore - minScore).toFixed(1)} puntos a tu ${lowDim.label} (${minScore.toFixed(1)}). ${weak.label} (${weak.score.toFixed(1)}) es el punto más débil. El desequilibrio hace que tu fortaleza quede sin respaldo.`;
      detected.push({ id: 4, title: 'Desequilibrio Integral', insight, color: COLOR_CAUTION });
    }
  }

  if (d1 <= LOW && d2 <= LOW && d3 <= LOW) {
    if (!detected.some(b => b.id === 5)) {
      const allSubs = dimensions.flatMap(d => d.subdimensions).sort((a, b) => a.score - b.score);
      const bottom3 = allSubs.slice(0, 3).map(s => `${s.label} (${s.score.toFixed(1)})`).join(', ');
      detected.push({
        id: 5,
        title: 'Estancamiento General',
        insight: `Las tres dimensiones están en zona crítica. Las áreas más urgentes: ${bottom3}. Se requiere acompañamiento e intervención prioritaria.`,
        color: COLOR_CRITICAL,
      });
    }
  }

  const excellentCount = scores.filter(s => s >= EXCELLENT).length;
  const belowHighCount = scores.filter(s => s < HIGH).length;
  if (excellentCount >= 1 && belowHighCount >= 2 && !detected.some(b => b.id <= 3)) {
    const excellentDim = dimensions.find(d => d.score >= EXCELLENT)!;
    const lagging = dimensions.filter(d => d.score < HIGH).map(d => `${d.label} (${d.score.toFixed(1)})`).join(' y ');
    detected.push({
      id: 6,
      title: 'Excelencia Parcial',
      insight: `Tu ${excellentDim.label} (${excellentDim.score.toFixed(1)}) destaca, pero ${lagging} limitan el cuadro completo. Es momento de elevar las dimensiones rezagadas.`,
      color: COLOR_CAUTION,
    });
  }

  if (detected.length === 0) {
    const allSubs = dimensions.flatMap(d => d.subdimensions).sort((a, b) => a.score - b.score);
    const highest = allSubs[allSubs.length - 1];
    const lowest = allSubs[0];

    if (highest && lowest) {
      detected.push({
        id: 7,
        title: 'Sinergia Potencial',
        insight: `Tus dimensiones principales están equilibradas. Al observar a detalle, tu mayor fortaleza es ${highest.label} (${highest.score.toFixed(1)}), mientras que ${lowest.label} (${lowest.score.toFixed(1)}) tiene el mayor margen de mejora. El siguiente salto es usar los recursos de tu fortaleza para impulsar de manera estratégica esa área débil.`,
        color: COLOR_SUCCESS,
      });
    }
  }

  return detected;
}
