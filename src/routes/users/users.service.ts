import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { UserModel, UserRoleEnum } from 'src/models/user.model';
import { hashData } from 'src/utils/helpers';

import { TransactionsService } from '../transactions/transactions.service';

import { CreateUserRequestDto } from './users.dtos';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
  ) {}

  /**
   * Sign up for a new user (customer, manager)
   */

  async createUser(
    payload: CreateUserRequestDto,
    roleType: UserRoleEnum,
  ): Promise<UserModel> {
    const targetUser = await this.prisma.user.findUnique({
      where: { username: payload.username },
    });

    if (targetUser) {
      throw new UnprocessableEntityException('Username is existed');
    }

    const hashedPassword = await hashData(payload.password);
    const createdUser = await this.prisma.user.create({
      data: {
        username: payload.username,
        password: hashedPassword,
        name: payload.name,
        role: roleType,
      },
    });

    return createdUser;
  }

  /**
   * Get User by Id
   */

  private async checkAndGetUserById(userId: string): Promise<UserModel> {
    const foundUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    return foundUser;
  }
}
