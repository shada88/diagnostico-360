import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ResetPasswordUseCase {
  constructor(private readonly usersService: UsersService) {}

  async execute(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findOne(email);
    if (!user) throw new BadRequestException('Usuario no encontrado');
    if (user.verificationCode !== code) {
      throw new BadRequestException('Código de verificación incorrecto');
    }
    await this.usersService.update(user.id, {
      password: newPassword,
      verificationCode: null,
      isEmailVerified: true,
    });
    return { message: 'Contraseña actualizada correctamente' };
  }
}
