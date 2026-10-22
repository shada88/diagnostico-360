// ─────────────────────────────────────────────────────────────────────────────
// Aligned with backend: src/diagnostic/evaluations/dto/dashboard.dto.ts
// ─────────────────────────────────────────────────────────────────────────────

export type MaturityLevel = 'CRITICO' | 'RIESGO' | 'ESTABLE' | 'COMPETENTE' | 'EXCELENTE';

export enum AnalyticalMode {
  CRISIS       = 'CRISIS',
  INTERVENTION = 'INTERVENTION',
  MAINTENANCE  = 'MAINTENANCE',
  GROWTH       = 'GROWTH',
}

export interface MaturityMeta {
  level: MaturityLevel;
  label: string;       // Spanish label: 'Crítico', 'Riesgo', etc.
  color: string;       // CSS hex for UI rendering
  description: string;
}

export interface SubdimensionResult {
  key: string;   // 'SPIRITUAL' | 'PERSONAL' | ...
  label: string; // 'Espiritual' | 'Personal' | ...
  score: number; // 1-10
  maturity: MaturityMeta;
}

export interface DimensionResult {
  key: string;   // 'INTERNAL' | 'BUSINESS' | 'GROWTH'
  label: string; // 'Área Interna' | 'Área del Negocio' | 'Área de Crecimiento'
  score: number; // 1-10
  maturity: MaturityMeta;
  subdimensions: SubdimensionResult[];
}

export interface RadarPoint {
  label: string;
  score: number; // 1-10
  maturity: MaturityMeta;
}

export interface CrossAlert {
  key: string;    // 'GLASS_CEILING' | 'LEAKY_BUCKET' | 'SUCCESS_COLLAPSE' | 'SELF_EMPLOYED'
  title: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM';
}

export interface DiagnosticPriority {
  key: string;
  label: string;
  score: number;
  maturity: MaturityMeta;
}

export interface DimensionAnalysis {
  insight: string;
  growthQuestion: string;
  keyAction: string;
}

// Cross-area cause→effect narrative shown on the dashboard. No numeric scores.
export interface ImpactConnection {
  title:        string;
  story:        string;
  quickImpacts: string[];
  severity:     'critical' | 'attention' | 'opportunity';
  focusAreas?:  string[];
}

export interface AiAnalysisDTO {
  executiveSummary: string;
  criticalAlertMessage: string;
  dimensionModules: {
    internal: DimensionAnalysis;
    business: DimensionAnalysis;
    growth: DimensionAnalysis;
  };
  // Per-area short, specific AI insight keyed by area key. No numbers.
  areaInsights: Record<string, string>;
  // Consolidated cross-area impact stories — replaces numeric findings on the client.
  impactConnections: ImpactConnection[];
  crossAlertInsights: string[];
  crudeWarning: string;
  actionPlan30Days: {
    foundation: string;
    tacticalSteps: string[]; // Exactly 3
  };
  conclusiveDiagnosis: string;
  mentorshipTransitionText: string;
}

export interface DashboardDTO {
  user: { name: string; businessName: string };
  global: {
    score: number;        // IG 1-10
    maturity: MaturityMeta;
    mode: AnalyticalMode;
  };
  dimensions: DimensionResult[];     // D1, D2, D3 with nested subdimensions
  radar: RadarPoint[];               // 10 axes
  strengths: DiagnosticPriority[];   // Top 3 subdimensions
  bottlenecks: DiagnosticPriority[]; // Bottom 3 subdimensions
  alerts: CrossAlert[];              // Active cross-inference alerts
  aiAnalysis?: AiAnalysisDTO;
}
