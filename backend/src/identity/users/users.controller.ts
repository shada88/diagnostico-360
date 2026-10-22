import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado o sesión expirada.');
    return this.usersService.update(userId, { ...dto, isProfileComplete: true });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado o sesión expirada.');
    const latestAttempt = await this.usersService.getLatestAttempt(req.user.userId);
    return {
      ...user,
      latestAttemptId: latestAttempt?.id ?? null,
      latestAttemptStatus: latestAttempt?.status ?? null,
    };
  }
}
