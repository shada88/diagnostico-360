import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class SurveysService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.survey.findMany({
      where: { isActive: true },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { questions: { orderBy: { order: 'asc' } } },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.survey.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { questions: { orderBy: { order: 'asc' } } },
        },
      },
    });
  }
}
