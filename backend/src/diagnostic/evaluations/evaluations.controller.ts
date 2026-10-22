import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CalculateResultsUseCase } from './use-cases/calculate-results.use-case';

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly calculateResultsUseCase: CalculateResultsUseCase) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':attemptId/calculate')
  async calculate(@Param('attemptId') attemptId: string) {
    return this.calculateResultsUseCase.execute(attemptId);
  }
}
