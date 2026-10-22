import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<any> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: any): Promise<any> {
    if (data.password && typeof data.password === 'string') {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({ where: { id }, data });
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  }

  async getLatestAttempt(userId: string) {
    return this.prisma.surveyAttempt.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { startedAt: 'desc' },
      select: { id: true, status: true },
    });
  }
}
