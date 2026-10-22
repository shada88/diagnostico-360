import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ResendVerificationCodeUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findOne(email);
    if (!user) throw new BadRequestException('Usuario no encontrado');
    if (user.isEmailVerified) return { message: 'Already verified' };
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    await this.usersService.update(user.id, { verificationCode: newCode });
    this.eventEmitter.emit('user.registered', { email: user.email, code: newCode });
    return { message: 'Verification code resent successfully' };
  }
}
