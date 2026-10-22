import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { MailService } from './mail.service';
import { ReminderCronService } from './reminder-cron.service';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [PrismaService, MailService, ReminderCronService],
  exports: [PrismaService, MailService],
})
export class CommonModule {}
