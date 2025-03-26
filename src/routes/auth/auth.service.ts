import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { UserModel, UserRole } from 'src/models/user.model';
import { hashData } from 'src/utils/helpers';

import { CreateUserRequestDto } from '../users/users.dtos';

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
   * Sign up for a new user (customer, manager)
   */

  async createUser(
    payload: CreateUserRequestDto,
    userRole: UserRole,
  ): Promise<UserModel> {
    if (payload.balance <= 0 && userRole === UserRole.CUSTOMER) {
      throw new UnprocessableEntityException('Balance must be greater than 0');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { username: payload.username },
    });

    if (targetUser) {
      throw new UnprocessableEntityException('Username is existed');
    }

    const hashedPassword = await hashData(payload.password);
    const createdUser = await this.prisma.user.create({
      data: {
        ...payload,
        password: hashedPassword,
        role: userRole,
      },
    });

    return createdUser as UserModel;
  }

  /**
   * Sign in
   */

  async signIn(payload: SignInDto): Promise<TokensResponse & UserModel> {
    const targetUser = await this.prisma.user.findUnique({
      where: {
        username: payload.username,
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
        username: targetUser.username,
        name: targetUser.name,
        role: targetUser.role,
      },
    });

    return {
      ...tokens,
      ...targetUser,
    } as TokensResponse & UserModel;
  }
}
