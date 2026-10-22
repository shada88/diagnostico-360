import { Module } from '@nestjs/common';
import { EvaluationsController } from './evaluations.controller';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from '../../common/prisma.service';
import { AiModule } from '../../ai/ai.module';
import { ScoringService } from './scoring.service';
import { RuleBasedInsightService } from './rule-based-insight.service';
import { AiAnalysisService } from './ai-analysis.service';
import { AnalyticsModule } from '../../analytics/analytics.module';
import { CalculateResultsUseCase } from './use-cases/calculate-results.use-case';
import { GetDashboardUseCase } from './use-cases/get-dashboard.use-case';
import { GetAnswersByDimensionUseCase } from './use-cases/get-answers-by-dimension.use-case';
import { GetOrGenerateEvolutionUseCase } from './use-cases/get-or-generate-evolution.use-case';

@Module({
  imports: [AiModule, AnalyticsModule],
  controllers: [EvaluationsController, DashboardController],
  providers: [
    PrismaService,
    ScoringService,
    RuleBasedInsightService,
    AiAnalysisService,
    GetDashboardUseCase,
    GetAnswersByDimensionUseCase,
    GetOrGenerateEvolutionUseCase,
    CalculateResultsUseCase,
  ],
  exports: [CalculateResultsUseCase],
})
export class EvaluationsModule {}
