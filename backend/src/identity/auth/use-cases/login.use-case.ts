import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { ValidatedUser } from '../dto/validated-user.type';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(user: ValidatedUser) {
    const rolesArray = user.userRoles?.map((ur) => ur.role.name) ?? ['USER'];

    const payload = {
      email: user.email,
      sub:   user.id,
      roles: rolesArray,
    };

    const latestAttempt = await this.usersService.getLatestAttempt(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        name:                user.name,
        email:               user.email,
        isProfileComplete:   user.isProfileComplete,
        latestAttemptId:     latestAttempt?.id ?? null,
        latestAttemptStatus: latestAttempt?.status ?? null,
      },
    };
  }
}
