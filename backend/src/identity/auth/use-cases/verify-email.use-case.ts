import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class VerifyEmailUseCase {
  constructor(private readonly usersService: UsersService) {}

  async execute(email: string, code: string): Promise<{ message: string }> {
    const user = await this.usersService.findOne(email);
    if (!user) throw new BadRequestException('Usuario no encontrado');
    if (user.isEmailVerified) return { message: 'Already verified' };
    if (user.verificationCode !== code) {
      throw new BadRequestException('Código de verificación incorrecto');
    }
    await this.usersService.update(user.id, {
      isEmailVerified: true,
      verificationCode: null,
    });
    return { message: 'Email verified successfully' };
  }
}
