import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/app/prisma/prisma.service';

import { SignInDto } from './auth.dtos';
import { TokensResponse } from './auth.types';
import { getTokens } from './auth.utils';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Sign in
   */

  async signIn(payload: SignInDto): Promise<TokensResponse> {
    const targetUser = await this.prisma.user.findUnique({
      where: {
        username: payload.username,
      },
      include: {
        account: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User cannot be found');
    }

    const isPasswordMatched = await bcrypt.compare(
      payload.password,
      targetUser.password,
    );

    if (!isPasswordMatched) {
      throw new ForbiddenException('Password is incorrect');
    }

    const tokens = await getTokens({
      jwtService: this.jwtService,
      jwtPayload: {
        userId: targetUser.id,
        accountId: targetUser?.account?.id,
        username: targetUser.username,
        name: targetUser.name,
        role: targetUser.role,
      },
    });

    return tokens;
  }
}
