import type { AiAnalysisDTO } from '@/types/dashboard';
import type { Finding } from '../types';

export function resolveDimensionAnalysis(
  finding: Finding,
  ai: AiAnalysisDTO,
): AiAnalysisDTO['dimensionModules'][keyof AiAnalysisDTO['dimensionModules']] | null {
  const DIM_LABEL_MAP: Record<string, keyof AiAnalysisDTO['dimensionModules']> = {
    'Área Interna':        'internal',
    'Área del Negocio':    'business',
    'Área de Crecimiento': 'growth',
  };

  for (const area of finding.relatedAreas) {
    const dimKey = DIM_LABEL_MAP[area];
    if (dimKey && ai.dimensionModules?.[dimKey]) {
      return ai.dimensionModules[dimKey];
    }
  }
  return null;
}

export function enrichFindingWithAI(finding: Finding, ai: AiAnalysisDTO): Finding {
  const enriched = { ...finding };
  const dimAnalysis = resolveDimensionAnalysis(finding, ai);

  switch (finding.category) {
    case 'critical-risk':
      if (ai.criticalAlertMessage && ai.criticalAlertMessage !== 'N/A') {
        enriched.insight = ai.criticalAlertMessage;
      }
      if (dimAnalysis?.insight) {
        enriched.meaning = dimAnalysis.insight;
      }
      break;

    case 'attention-point':
      if (ai.crossAlertInsights?.[0]) {
        enriched.insight = ai.crossAlertInsights[0];
      }
      if (dimAnalysis?.insight) {
        enriched.meaning = dimAnalysis.insight;
      }
      break;

    case 'improvement-area':
      if (ai.crossAlertInsights?.[1]) {
        enriched.insight = ai.crossAlertInsights[1];
      }
      if (dimAnalysis?.growthQuestion) {
        enriched.insight = dimAnalysis.growthQuestion;
      }
      break;

    case 'strategic-strength':
      if (ai.conclusiveDiagnosis && ai.conclusiveDiagnosis !== 'N/A') {
        enriched.insight = ai.conclusiveDiagnosis;
      }
      break;
  }

  return enriched;
}
