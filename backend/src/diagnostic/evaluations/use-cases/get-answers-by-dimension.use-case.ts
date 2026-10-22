import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { SUB_LABELS, DIMENSION_SUBS, DIMENSION_LABELS } from '../constants';

const DIMENSION_ORDER = ['INTERNAL', 'BUSINESS', 'GROWTH'];

export interface DimensionAnswersDTO {
  key:   string;
  label: string;
  subdimensions: Array<{
    key:       string;
    label:     string;
    score:     number;
    questions: Array<{ index: number; text: string; value: number }>;
  }>;
}

@Injectable()
export class GetAnswersByDimensionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(attemptId: string): Promise<DimensionAnswersDTO[]> {
    const answers = await this.prisma.answer.findMany({
      where: { attemptId },
      include: { question: true },
    });

    if (answers.length === 0) return [];

    const grouped: Record<string, Record<string, Array<{ text: string; value: number; order: number }>>> = {};

    for (const answer of answers) {
      const dim = answer.question.dimension as string;
      const sub = answer.question.subdimension as string;
      if (!grouped[dim]) grouped[dim] = {};
      if (!grouped[dim][sub]) grouped[dim][sub] = [];
      grouped[dim][sub].push({
        text:  answer.question.text,
        value: answer.value,
        order: answer.question.order,
      });
    }

    return DIMENSION_ORDER
      .filter(dim => grouped[dim])
      .map(dim => {
        const allDimQs = DIMENSION_SUBS[dim]
          .flatMap(sub => grouped[dim]?.[sub] ?? [])
          .sort((a, b) => a.order - b.order);
        const dimPosMap = new Map(allDimQs.map((q, i) => [q.order, i + 1]));

        return {
          key:   dim,
          label: DIMENSION_LABELS[dim],
          subdimensions: DIMENSION_SUBS[dim]
            .filter(sub => grouped[dim]?.[sub])
            .map(sub => {
              const qs    = grouped[dim][sub].sort((a, b) => a.order - b.order);
              const score = Math.round((qs.reduce((s, q) => s + q.value, 0) / qs.length) * 10) / 10;
              return {
                key:   sub,
                label: SUB_LABELS[sub],
                score,
                questions: qs.map(q => ({
                  index: dimPosMap.get(q.order) ?? 0,
                  text:  q.text,
                  value: q.value,
                })),
              };
            }),
        };
      });
  }
}
