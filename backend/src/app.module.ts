import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsModule } from './analytics/analytics.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { IdentityDomainModule } from './identity/identity.module';
import { DiagnosticDomainModule } from './diagnostic/diagnostic.module';
import { configuration } from './config';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      envFilePath: [
        path.resolve(process.cwd(), '.env'),           // backend/.env (cuando se corre desde backend/)
        path.resolve(__dirname, '..', '..', '.env'),   // fallback: ruta relativa al dist/
      ],
    }),
    EventEmitterModule.forRoot(),
    AiModule,
    CommonModule,
    AnalyticsModule,
    IdentityDomainModule,
    DiagnosticDomainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
