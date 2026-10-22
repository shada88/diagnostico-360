import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { AppConfig } from '../../config';
import { ValidateUserUseCase } from './use-cases/validate-user.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';
import { ResendVerificationCodeUseCase } from './use-cases/resend-verification-code.use-case';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case';
import { GoogleLoginOrRegisterUseCase } from './use-cases/google-login-or-register.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly validateUserUseCase: ValidateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationCodeUseCase: ResendVerificationCodeUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly googleLoginOrRegisterUseCase: GoogleLoginOrRegisterUseCase,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.validateUserUseCase.execute(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.loginUseCase.execute(user);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.verifyEmailUseCase.execute(dto.email, dto.code);
  }

  @Post('resend-code')
  async resendCode(@Body() dto: ResendCodeDto) {
    return this.resendVerificationCodeUseCase.execute(dto.email);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute(dto.email, dto.code, dto.newPassword);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Request() req, @Res() res: Response) {
    const result = await this.googleLoginOrRegisterUseCase.execute(req.user);
    const frontendUrl = this.configService.get('app.frontendUrl', { infer: true });
    const profileComplete = result.user.isProfileComplete ? 'true' : 'false';
    res.redirect(
      `${frontendUrl}/auth/google/callback?token=${result.access_token}&profileComplete=${profileComplete}`,
    );
  }
}
