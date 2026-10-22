import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { CalculateResultsUseCase } from '../evaluations/use-cases/calculate-results.use-case';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SaveAnswerDto } from './dto/save-answer.dto';
import type { AppConfig } from '../../config';

@Injectable()
export class ResponsesService {
  constructor(
    private prisma: PrismaService,
    private calculateResultsUseCase: CalculateResultsUseCase,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService<AppConfig, true>,
  ) {}

  async findAllByUser(userId: string) {
    const attempts = await this.prisma.surveyAttempt.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: { diagnostic: true },
      orderBy: { startedAt: 'desc' },
    });

    return attempts.map(a => ({
      id:          a.id,
      createdAt:   a.startedAt.toISOString(),
      status:      a.status as 'IN_PROGRESS' | 'COMPLETED',
      globalScore: a.diagnostic?.scoreIG ?? undefined,
    }));
  }

  async start(userId: string | null, surveyId: string) {
    return this.prisma.surveyAttempt.create({
      data: {
        userId: userId ?? undefined,
        surveyId,
        status: 'IN_PROGRESS',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.surveyAttempt.findUnique({
      where: { id },
      include: { answers: true, diagnostic: true, aiEval: true },
    });
  }

  async saveAnswer(attemptId: string, answerDto: SaveAnswerDto) {
    return this.prisma.answer.upsert({
      where: { attemptId_questionId: { attemptId, questionId: answerDto.questionId } },
      update: { value: answerDto.value },
      create: { attemptId, questionId: answerDto.questionId, value: answerDto.value },
    });
  }

  async softDelete(id: string) {
    await this.prisma.surveyAttempt.update({
      where: { id },
      data:  { deletedAt: new Date() },
    });
    return { success: true };
  }

  async finalize(attemptId: string) {
    const result = await this.calculateResultsUseCase.execute(attemptId);

    const attempt = await this.prisma.surveyAttempt.findUnique({
      where: { id: attemptId },
      include: { user: true },
    });

    if (attempt?.user?.email) {
      const frontendUrl = this.configService.get('app.frontendUrl', { infer: true });
      const resultUrl = `${frontendUrl}/personal/resultados/${attemptId}`;
      this.eventEmitter.emit('survey.completed', {
        email: attempt.user.email,
        userName: attempt.user.name,
        resultUrl,
      });
    }

    return result;
  }
}
