import { Controller, Get, Param } from '@nestjs/common';
import { GetDashboardUseCase } from './use-cases/get-dashboard.use-case';
import { GetAnswersByDimensionUseCase } from './use-cases/get-answers-by-dimension.use-case';
import { GetOrGenerateEvolutionUseCase } from './use-cases/get-or-generate-evolution.use-case';

@Controller('results')
export class DashboardController {
  constructor(
    private readonly getDashboardUseCase: GetDashboardUseCase,
    private readonly getAnswersByDimensionUseCase: GetAnswersByDimensionUseCase,
    private readonly getOrGenerateEvolutionUseCase: GetOrGenerateEvolutionUseCase,
  ) {}

  @Get(':id')
  async getDashboard(@Param('id') id: string) {
    return this.getDashboardUseCase.execute(id);
  }

  @Get(':id/global')
  async getGlobal(@Param('id') id: string) {
    const dashboard = await this.getDashboardUseCase.execute(id);
    return dashboard.global;
  }

  @Get(':id/radar')
  async getRadar(@Param('id') id: string) {
    const dashboard = await this.getDashboardUseCase.execute(id);
    return dashboard.radar;
  }

  @Get(':id/dimensions')
  async getDimensions(@Param('id') id: string) {
    const dashboard = await this.getDashboardUseCase.execute(id);
    return dashboard.dimensions;
  }

  @Get(':id/alerts')
  async getAlerts(@Param('id') id: string) {
    const dashboard = await this.getDashboardUseCase.execute(id);
    return { alerts: dashboard.alerts, bottlenecks: dashboard.bottlenecks };
  }

  @Get(':id/answers')
  async getAnswers(@Param('id') id: string) {
    return this.getAnswersByDimensionUseCase.execute(id);
  }

  @Get(':currentId/evolution/:previousId')
  async getEvolution(
    @Param('currentId') currentId: string,
    @Param('previousId') previousId: string,
  ) {
    const [currentData, previousData] = await Promise.all([
      this.getDashboardUseCase.execute(currentId),
      this.getDashboardUseCase.execute(previousId),
    ]);
    return this.getOrGenerateEvolutionUseCase.execute(
      currentId,
      previousId,
      currentData,
      previousData,
    );
  }
}
