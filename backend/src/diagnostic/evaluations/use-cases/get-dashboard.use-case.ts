import { Injectable } from '@nestjs/common';
import { MaturityLevel } from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';
import { ScoringService } from '../scoring.service';
import { RuleBasedInsightService } from '../rule-based-insight.service';
import {
  DashboardDTO,
  DimensionResult,
  SubdimensionResult,
  RadarPoint,
  DiagnosticPriority,
  AnalyticalMode,
  MaturityMeta,
} from '../dto/dashboard.dto';
import { SUB_LABELS, DIMENSION_SUBS, DIMENSION_LABELS } from '../constants';

@Injectable()
export class GetDashboardUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
    private readonly ruleInsightService: RuleBasedInsightService,
  ) {}

  async execute(attemptId: string): Promise<DashboardDTO> {
    const attempt = await this.prisma.surveyAttempt.findUnique({
      where: { id: attemptId },
      include: {
        user:       true,
        diagnostic: true,
        aiEval:     true,
      },
    });

    if (!attempt?.diagnostic) {
      throw new Error(`DiagnosticResult not found for attempt ${attemptId}`);
    }

    const d    = attempt.diagnostic;
    const meta = (level: MaturityLevel): MaturityMeta =>
      this.ruleInsightService.buildMaturityMeta(level);

    const subScores: Record<string, { score: number; maturity: MaturityMeta }> = {
      SPIRITUAL:  { score: d.scoreSpiritual,  maturity: meta(d.maturityD1) },
      PERSONAL:   { score: d.scorePersonal,   maturity: meta(this.scoringService.classifyMaturity(d.scorePersonal)) },
      RELATIONAL: { score: d.scoreRelational, maturity: meta(this.scoringService.classifyMaturity(d.scoreRelational)) },
      PURPOSE:    { score: d.scorePurpose,    maturity: meta(this.scoringService.classifyMaturity(d.scorePurpose)) },
      FINANCIAL:  { score: d.scoreFinancial,  maturity: meta(this.scoringService.classifyMaturity(d.scoreFinancial)) },
      SALES:      { score: d.scoreSales,      maturity: meta(this.scoringService.classifyMaturity(d.scoreSales)) },
      OPERATIONS: { score: d.scoreOperations, maturity: meta(this.scoringService.classifyMaturity(d.scoreOperations)) },
      MARKETING:  { score: d.scoreMarketing,  maturity: meta(this.scoringService.classifyMaturity(d.scoreMarketing)) },
      LEADERSHIP: { score: d.scoreLeadership, maturity: meta(this.scoringService.classifyMaturity(d.scoreLeadership)) },
      PLANNING:   { score: d.scorePlanning,   maturity: meta(this.scoringService.classifyMaturity(d.scorePlanning)) },
    };

    subScores.SPIRITUAL.maturity = meta(this.scoringService.classifyMaturity(d.scoreSpiritual));

    const dimScores: Record<string, { score: number; level: MaturityLevel }> = {
      INTERNAL: { score: d.scoreD1, level: d.maturityD1 },
      BUSINESS: { score: d.scoreD2, level: d.maturityD2 },
      GROWTH:   { score: d.scoreD3, level: d.maturityD3 },
    };

    const dimensions: DimensionResult[] = Object.entries(DIMENSION_SUBS).map(([dimKey, subKeys]) => {
      const { score, level } = dimScores[dimKey];
      const subdimensions: SubdimensionResult[] = subKeys.map((subKey) => ({
        key:   subKey,
        label: SUB_LABELS[subKey],
        score: subScores[subKey].score,
        maturity: subScores[subKey].maturity,
      }));
      return {
        key:   dimKey,
        label: DIMENSION_LABELS[dimKey],
        score,
        maturity: meta(level),
        subdimensions,
      };
    });

    const radar: RadarPoint[] = Object.keys(SUB_LABELS).map((subKey) => ({
      label: SUB_LABELS[subKey],
      score: subScores[subKey].score,
      maturity: subScores[subKey].maturity,
    }));

    const allSubs: DiagnosticPriority[] = Object.keys(SUB_LABELS).map((subKey) => ({
      key:   subKey,
      label: SUB_LABELS[subKey],
      score: subScores[subKey].score,
      maturity: subScores[subKey].maturity,
    }));

    const sorted      = [...allSubs].sort((a, b) => b.score - a.score);
    const strengths   = sorted.slice(0, 3);
    const bottlenecks = sorted.slice(-3).reverse();

    const alerts = this.ruleInsightService.buildActiveAlerts({
      alertGlassCeiling:    d.alertGlassCeiling,
      alertLeakyBucket:     d.alertLeakyBucket,
      alertSuccessCollapse: d.alertSuccessCollapse,
      alertSelfEmployed:    d.alertSelfEmployed,
    });

    const mode: AnalyticalMode = this.ruleInsightService.getAnalyticalMode(d.scoreIG);

    let aiAnalysis = undefined;
    if (attempt.aiEval?.content) {
      try {
        const parsed = JSON.parse(attempt.aiEval.content);
        if (parsed.executiveSummary && parsed.dimensionModules) {
          aiAnalysis = parsed;
        }
      } catch {
        aiAnalysis = undefined;
      }
    }

    return {
      user: {
        name:         attempt.user?.name         || 'Emprendedor',
        businessName: attempt.user?.businessName || 'Mi Negocio',
      },
      global: {
        score: d.scoreIG,
        maturity: meta(d.maturityGlobal),
        mode,
      },
      dimensions,
      radar,
      strengths,
      bottlenecks,
      alerts,
      aiAnalysis,
    };
  }
}
