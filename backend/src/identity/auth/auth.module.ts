import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { RegisterUseCase } from './use-cases/register.use-case';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';
import { ResendVerificationCodeUseCase } from './use-cases/resend-verification-code.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { ValidateUserUseCase } from './use-cases/validate-user.use-case';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case';
import { GoogleLoginOrRegisterUseCase } from './use-cases/google-login-or-register.use-case';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secretKey',
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    GoogleStrategy,
    RegisterUseCase,
    VerifyEmailUseCase,
    ResendVerificationCodeUseCase,
    LoginUseCase,
    ValidateUserUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    GoogleLoginOrRegisterUseCase,
  ],
})
export class AuthModule {}
