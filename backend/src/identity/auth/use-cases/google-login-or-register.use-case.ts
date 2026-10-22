import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersService } from '../../users/users.service';
import { LoginUseCase } from './login.use-case';
import { ValidatedUser } from '../dto/validated-user.type';

@Injectable()
export class GoogleLoginOrRegisterUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async execute(googleUser: { email: string; name: string; picture?: string }) {
    let user = await this.usersService.findOne(googleUser.email);
    if (!user) {
      const randomPassword = await bcrypt.hash(randomUUID(), 10);
      await this.usersService.create({
        email:           googleUser.email,
        name:            googleUser.name,
        password:        randomPassword,
        isEmailVerified: true,
        userRoles: {
          create: [{ role: { connect: { name: 'USER' } } }],
        },
      });
      user = await this.usersService.findOne(googleUser.email);
    }
    const { password: _pw, ...userWithoutPassword } = user!;
    return this.loginUseCase.execute(userWithoutPassword as ValidatedUser);
  }
}
