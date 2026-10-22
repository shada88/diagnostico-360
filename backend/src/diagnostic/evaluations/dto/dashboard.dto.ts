import { MaturityLevel } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export { MaturityLevel };

export enum AnalyticalMode {
  CRISIS       = 'CRISIS',        // IG < 4   (CRITICO)
  INTERVENTION = 'INTERVENTION',  // IG 4-5.9 (RIESGO)
  MAINTENANCE  = 'MAINTENANCE',   // IG 6-7.9 (ESTABLE)
  GROWTH       = 'GROWTH',        // IG >= 8  (COMPETENTE / EXCELENTE)
}

// ─────────────────────────────────────────────────────────────────────────────
// MATURITY METADATA (for UI rendering)
// ─────────────────────────────────────────────────────────────────────────────

export interface MaturityMeta {
  level: MaturityLevel;
  label: string;    // Español
  color: string;    // CSS hex / token
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBDIMENSION
// ─────────────────────────────────────────────────────────────────────────────

export interface SubdimensionResult {
  key: string;    // 'SPIRITUAL' | 'PERSONAL' | ...
  label: string;  // 'Espiritual' | 'Personal' | ...
  score: number;  // 1-10
  maturity: MaturityMeta;
}

// ─────────────────────────────────────────────────────────────────────────────
// DIMENSION
// ─────────────────────────────────────────────────────────────────────────────

export interface DimensionResult {
  key: string;   // 'INTERNAL' | 'BUSINESS' | 'GROWTH'
  label: string; // 'Área Interna' | 'Área del Negocio' | 'Área de Crecimiento'
  score: number; // 1-10
  maturity: MaturityMeta;
  subdimensions: SubdimensionResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// RADAR
// ─────────────────────────────────────────────────────────────────────────────

export interface RadarPoint {
  label: string;
  score: number; // 1-10
  maturity: MaturityMeta;
}

// ─────────────────────────────────────────────────────────────────────────────
// CROSS-INFERENCE ALERTS
// ─────────────────────────────────────────────────────────────────────────────

export interface CrossAlert {
  key: string;    // 'GLASS_CEILING' | 'LEAKY_BUCKET' | ...
  title: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM';
}

// ─────────────────────────────────────────────────────────────────────────────
// STRENGTH / BOTTLENECK ITEM
// ─────────────────────────────────────────────────────────────────────────────

export interface DiagnosticPriority {
  key: string;
  label: string;
  score: number;
  maturity: MaturityMeta;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

export interface DimensionAnalysis {
  insight: string;
  growthQuestion: string;
  keyAction: string;
}

/**
 * Cross-area strategic impact connection.
 *
 * The narrative unit the dashboard shows to the user — replaces per-area
 * numeric analyses. Each connection consolidates one cause→effect story
 * across two or more areas, NEVER quotes scores in the body.
 */
export interface ImpactConnection {
  /** Short, memorable headline (max ~12 words). No numbers. */
  title: string;
  /** 1–2 sentence narrative explaining cause → effect across areas. No numbers. */
  story: string;
  /** Max 3 punchy consequences. Each bullet ≤ 14 words. No numbers. */
  quickImpacts: string[];
  /** Visual severity hint for the card accent. */
  severity: 'critical' | 'attention' | 'opportunity';
  /** Optional list of area keys involved — used for tagging chips. */
  focusAreas?: string[];
}

export interface AiAnalysisDTO {
  executiveSummary: string;
  criticalAlertMessage: string;
  dimensionModules: {
    internal: DimensionAnalysis;
    business: DimensionAnalysis;
    growth: DimensionAnalysis;
  };
  /**
   * Per-area concise insight keyed by area key (SPIRITUAL, PERSONAL, RELATIONAL,
   * PURPOSE, FINANCIAL, SALES, OPERATIONS, MARKETING, LEADERSHIP, PLANNING).
   * Shown inline in the interactive radar's area detail panel — short, specific,
   * and revealing (NOT generic maturity level descriptions). No numbers.
   */
  areaInsights: Record<string, string>;
  /**
   * Consolidated cross-area cause→effect stories. 1–4 entries depending on
   * severity. Replaces the old `findings` rendering on the client. Smart
   * de-duplication is the AI's responsibility (one entry per root cause).
   */
  impactConnections: ImpactConnection[];
  crossAlertInsights: string[];
  crudeWarning: string;
  actionPlan30Days: {
    /** Guiding principle for the next 30 days. */
    foundation: string;
    /** EXACTLY 3 concrete, strategic, simple actions. */
    tacticalSteps: string[];
  };
  conclusiveDiagnosis: string;
  mentorshipTransitionText: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD (root response)
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardDTO {
  user: { name: string; businessName: string };
  global: {
    score: number;         // IG 1-10
    maturity: MaturityMeta;
    mode: AnalyticalMode;
  };
  dimensions: DimensionResult[];    // D1, D2, D3 with nested subdimensions
  radar: RadarPoint[];              // 10 axes for the radar chart
  strengths: DiagnosticPriority[];  // Top 3 subdimensions
  bottlenecks: DiagnosticPriority[];// Bottom 3 subdimensions
  alerts: CrossAlert[];             // Active cross-inference alerts
  aiAnalysis?: AiAnalysisDTO;
}
