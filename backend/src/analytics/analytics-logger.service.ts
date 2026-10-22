import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AnalyticsLoggerService {
  private readonly logger = new Logger(AnalyticsLoggerService.name);

  logAnalysisEvent(event: {
    attemptId: string;
    userRole: string;
    globalScore: number;
    riskLevel: string;
    flags: string[];
  }) {
    this.logger.log(`[ANALYSIS COMPLETED] Attempt: ${event.attemptId}`);
    this.logger.log(`Metric:GlobalScore:${event.globalScore}`);
    this.logger.log(`Metric:RiskLevel:${event.riskLevel}`);
    this.logger.log(`Metric:UserRole:${event.userRole}`);

    if (event.flags.length > 0) {
      this.logger.warn(`FlagsDetected:${event.flags.length}`);
      event.flags.forEach((flag) => this.logger.warn(`Flag:${flag}`));
    } else {
      this.logger.log(`FlagsDetected:0`);
    }
  }
}
