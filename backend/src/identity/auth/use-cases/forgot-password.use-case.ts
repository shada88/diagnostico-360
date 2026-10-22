import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const response = { message: 'Si el correo existe, el código de recuperación fue enviado.' };
    const user = await this.usersService.findOne(email);
    if (!user) return response;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.usersService.update(user.id, { verificationCode: code });
    this.eventEmitter.emit('password.reset', { email: user.email, code });
    return response;
  }
}
