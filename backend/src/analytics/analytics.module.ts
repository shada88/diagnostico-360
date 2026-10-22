import { Module } from '@nestjs/common';
import { AnalyticsLoggerService } from './analytics-logger.service';

@Module({
  providers: [AnalyticsLoggerService],
  exports: [AnalyticsLoggerService],
})
export class AnalyticsModule {}
