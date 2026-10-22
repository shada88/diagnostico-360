// Aligned with backend: src/diagnostic/evaluations/use-cases/get-or-generate-evolution.use-case.ts

export interface EvolutionAnalysisDTO {
  overallVerdict: 'PROGRESO' | 'ESTANCAMIENTO' | 'RETROCESO' | 'MIXTO';
  executiveSummary: string;
  dimensionAnalysis: {
    internal: { trend: string; insight: string; recommendation: string };
    business: { trend: string; insight: string; recommendation: string };
    growth:   { trend: string; insight: string; recommendation: string };
  };
  criticalPatterns: string[];
  topGains:    Array<{ area: string; delta: number; insight: string }>;
  topDeclines: Array<{ area: string; delta: number; insight: string }>;
  strategicRecommendation: string;
}
