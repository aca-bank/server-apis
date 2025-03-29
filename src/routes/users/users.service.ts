import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { UserModel, UserRoleEnum } from 'src/models/user.model';
import { hashData } from 'src/utils/helpers';

import { BankAccountsService } from '../bank-accounts/bank-accounts.service';

import { CreateUserRequestDto } from './users.dtos';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private bankAccountsService: BankAccountsService,
  ) {}

  /**
   * Create for Customer
   */

  async createCustomer(payload: CreateUserRequestDto): Promise<UserModel> {
    const createdCustomer = await this.createUser(
      payload,
      UserRoleEnum.CUSTOMER,
    );

    const createdAccount = await this.bankAccountsService.createAccount(
      createdCustomer.id,
    );

    createdCustomer.account = createdAccount;
    return createdCustomer;
  }

  /**
   * Create for Manager
   */

  async createManager(payload: CreateUserRequestDto): Promise<UserModel> {
    const createdManager = await this.createUser(payload, UserRoleEnum.MANAGER);
    return createdManager;
  }

  /**
   * Create a new user (customer, manager)
   */

  private async createUser(
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
}
