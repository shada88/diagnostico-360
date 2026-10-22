import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/users.service';
import { ValidatedUser } from '../dto/validated-user.type';

@Injectable()
export class ValidateUserUseCase {
  constructor(private readonly usersService: UsersService) {}

  async execute(email: string, password: string): Promise<ValidatedUser | null> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _pw, ...result } = user;
      return result as ValidatedUser;
    }
    return null;
  }
}
