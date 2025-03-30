import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { OmitPrismaMiddlewareService } from 'src/app/prisma/prisma.types';
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
    const result = await this.prisma.$transaction(async (prisma) => {
      const createdCustomer = await this.createUser({
        payload,
        roleType: UserRoleEnum.CUSTOMER,
        prisma,
      });

      const createdAccount = await this.bankAccountsService.createAccount({
        userId: createdCustomer.id,
        prisma,
      });

      createdCustomer.account = createdAccount;
      return createdCustomer;
    });

    return result;
  }

  /**
   * Create for Manager
   */

  async createManager(payload: CreateUserRequestDto): Promise<UserModel> {
    const createdManager = await this.createUser({
      payload,
      roleType: UserRoleEnum.MANAGER,
    });
    return createdManager;
  }

  /**
   * Create a new user (customer, manager)
   */

  async createUser(props: {
    payload: CreateUserRequestDto;
    roleType: UserRoleEnum;
    prisma?: OmitPrismaMiddlewareService;
  }): Promise<UserModel> {
    const { payload, roleType, prisma = this.prisma } = props;

    const targetUser = await prisma.user.findUnique({
      where: { username: payload.username },
    });

    if (targetUser) {
      throw new UnprocessableEntityException('Username is existed');
    }

    const hashedPassword = await hashData(payload.password);
    const createdUser = await prisma.user.create({
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
