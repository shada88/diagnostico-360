import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { AppConfig } from '../config';

/**
 * Checks every hour for users whose last completed diagnosis was 30+ days ago
 * and sends a reminder email — respecting the user's timezone (sends ~9am local).
 */
@Injectable()
export class ReminderCronService {
  private readonly logger = new Logger(ReminderCronService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService<AppConfig, true>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleReminders() {
    this.logger.log('Checking for 30-day diagnosis reminders...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find the most recent COMPLETED attempt per user, where:
    // - endedAt <= 30 days ago
    // - reminderSentAt IS NULL
    // - No newer attempt exists for that user
    const candidates = await this.prisma.surveyAttempt.findMany({
      where: {
        status: 'COMPLETED',
        endedAt: { lte: thirtyDaysAgo },
        reminderSentAt: null,
        deletedAt: null,
        userId: { not: null },
      },
      include: {
        user: true,
      },
      orderBy: { endedAt: 'desc' },
    });

    // Group by user — keep only the most recent per user
    const userLatest = new Map<string, typeof candidates[0]>();
    for (const attempt of candidates) {
      if (!attempt.userId || !attempt.user) continue;
      if (!userLatest.has(attempt.userId)) {
        userLatest.set(attempt.userId, attempt);
      }
    }

    // For each user, check there's no newer attempt (completed or in-progress)
    for (const [userId, attempt] of userLatest) {
      const newerAttempt = await this.prisma.surveyAttempt.findFirst({
        where: {
          userId,
          deletedAt: null,
          startedAt: { gt: attempt.endedAt! },
        },
      });

      if (newerAttempt) continue; // User already started a new one

      // Check timezone — only send if it's approximately 9am in user's local time
      const userTz = attempt.user?.timezone || 'America/New_York';
      const nowInUserTz = new Date().toLocaleString('en-US', { timeZone: userTz, hour12: false });
      const localHour = parseInt(nowInUserTz.split(', ')[1]?.split(':')[0] ?? '0', 10);

      if (localHour < 8 || localHour > 10) continue; // Only send between 8-10am local

      // Emit the reminder event
      const frontendUrl = this.configService.get('app.frontendUrl', { infer: true });
      const resultUrl = `${frontendUrl}/personal/resultados/${attempt.id}`;

      this.eventEmitter.emit('diagnosis.reminder', {
        email: attempt.user!.email,
        userName: attempt.user!.name || 'Emprendedor',
        lastResultUrl: resultUrl,
        daysSince: Math.floor(
          (Date.now() - (attempt.endedAt?.getTime() ?? Date.now())) / (1000 * 60 * 60 * 24),
        ),
      });

      // Mark as sent
      await this.prisma.surveyAttempt.update({
        where: { id: attempt.id },
        data: { reminderSentAt: new Date() },
      });

      this.logger.log(`Reminder sent to ${attempt.user!.email} (${userTz})`);
    }
  }
}
