import { Module } from '@nestjs/common';
import { SurveysModule } from './surveys/surveys.module';
import { ResponsesModule } from './responses/responses.module';
import { EvaluationsModule } from './evaluations/evaluations.module';

@Module({
  imports: [SurveysModule, ResponsesModule, EvaluationsModule],
})
export class DiagnosticDomainModule {}
