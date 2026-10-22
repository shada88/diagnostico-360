import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { ScoringService } from '../scoring.service';
import { RuleBasedInsightService } from '../rule-based-insight.service';
import { AiAnalysisService } from '../ai-analysis.service';
import { AnalyticsLoggerService } from '../../../analytics/analytics-logger.service';
import { GetDashboardUseCase } from './get-dashboard.use-case';
import { DashboardDTO } from '../dto/dashboard.dto';

@Injectable()
export class CalculateResultsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
    private readonly ruleInsightService: RuleBasedInsightService,
    private readonly aiAnalysisService: AiAnalysisService,
    private readonly analyticsLogger: AnalyticsLoggerService,
    private readonly getDashboardUseCase: GetDashboardUseCase,
  ) {}

  async execute(attemptId: string): Promise<DashboardDTO | null> {
    try {
      const answers = await this.prisma.answer.findMany({
        where: { attemptId },
        include: { question: true },
      });

      if (answers.length === 0) return null;

      const sub  = this.scoringService.computeSubdimensions(answers);
      const dim  = this.scoringService.computeDimensions(sub);
      const crss = this.scoringService.computeCrossAlerts(sub, dim);

      const classify = (s: number) => this.scoringService.classifyMaturity(s);

      const diagnosticData = {
        scoreSpiritual:  sub.SPIRITUAL,
        scorePersonal:   sub.PERSONAL,
        scoreRelational: sub.RELATIONAL,
        scorePurpose:    sub.PURPOSE,
        scoreFinancial:  sub.FINANCIAL,
        scoreSales:      sub.SALES,
        scoreOperations: sub.OPERATIONS,
        scoreMarketing:  sub.MARKETING,
        scoreLeadership: sub.LEADERSHIP,
        scorePlanning:   sub.PLANNING,
        scoreD1: dim.d1,
        scoreD2: dim.d2,
        scoreD3: dim.d3,
        scoreIG: dim.ig,
        maturityD1:     classify(dim.d1),
        maturityD2:     classify(dim.d2),
        maturityD3:     classify(dim.d3),
        maturityGlobal: classify(dim.ig),
        alertGlassCeiling:    crss.alertGlassCeiling,
        alertLeakyBucket:     crss.alertLeakyBucket,
        alertSuccessCollapse: crss.alertSuccessCollapse,
        alertSelfEmployed:    crss.alertSelfEmployed,
      };

      await this.prisma.diagnosticResult.upsert({
        where: { attemptId },
        create: { attemptId, ...diagnosticData },
        update: diagnosticData,
      });

      await this.prisma.surveyAttempt.update({
        where: { id: attemptId },
        data: { status: 'COMPLETED', endedAt: new Date() },
      });

      try {
        const attempt = await this.prisma.surveyAttempt.findUnique({
          where: { id: attemptId },
          include: { user: true },
        });

        const mode   = this.ruleInsightService.getAnalyticalMode(dim.ig);
        const alerts = this.ruleInsightService.buildActiveAlerts(crss);

        const analysis = await this.aiAnalysisService.analyze({
          userName:     attempt?.user?.name         || 'Emprendedor',
          businessName: attempt?.user?.businessName || 'Mi Negocio',
          mode,
          subdimensions: sub,
          dimensions:    dim,
          alerts,
        });

        await this.prisma.aiEvaluation.upsert({
          where:  { attemptId },
          create: { attemptId, content: JSON.stringify(analysis) },
          update: { content: JSON.stringify(analysis) },
        });

        this.analyticsLogger.logAnalysisEvent({
          attemptId,
          userRole:    'Emprendedor',
          globalScore: dim.ig,
          riskLevel:   classify(dim.ig),
          flags:       alerts.map((a) => a.key),
        });
      } catch (aiError) {
        console.error('[CalculateResultsUseCase] AI analysis failed (non-fatal):', aiError);
      }

      return this.getDashboardUseCase.execute(attemptId);
    } catch (e) {
      console.error('[CalculateResultsUseCase] FATAL:', e instanceof Error ? e.stack : e);
      throw e;
    }
  }
}
