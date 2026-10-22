import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../../users/users.service';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: RegisterDto): Promise<{ message: string }> {
    const existingUser = await this.usersService.findOne(dto.email);
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    let user;
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new ConflictException('El correo electrónico ya está registrado.');
      } else {
        user = await this.usersService.update(existingUser.id, {
          password: dto.password,
          verificationCode,
        });
      }
    } else {
      user = await this.usersService.create({
        email: dto.email,
        password: hashedPassword,
        verificationCode,
        isEmailVerified: false,
        userRoles: {
          create: [{ role: { connect: { name: 'USER' } } }],
        },
      });
    }

    this.eventEmitter.emit('user.registered', { email: user.email, code: verificationCode });
    return { message: 'Verification code sent.' };
  }
}
