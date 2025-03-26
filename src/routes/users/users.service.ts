import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/app/prisma/prisma.service';
import {
  TransactionModel,
  TransactionType,
} from 'src/models/transaction.model';
import { UserModel } from 'src/models/user.model';

import { TransactionsService } from '../transactions/transactions.service';
import { transactionModelToDto } from '../transactions/transactions.utils';

import {
  DepositResponseDto,
  GetBalanceResponseDto,
  TransferResponseDto,
  WithdrawResponseDto,
} from './users.dtos';
import { userModelToDto } from './users.utils';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
  ) {}

  /**
   * Get current balance
   */

  async getBalance(userId: string): Promise<GetBalanceResponseDto> {
    const customer = await this.checkAndGetUserById(userId);
    return {
      balance: customer.balance,
    };
  }

  /**
   * Deposit
   */

  async depositToAccount(
    userId: string,
    amount: number,
  ): Promise<DepositResponseDto> {
    if (amount <= 0) {
      throw new UnprocessableEntityException('Amount must be greater than 0');
    }

    const customer = await this.checkAndGetUserById(userId);

    const result = await this.prisma.$transaction(async (prisma) => {
      const updatedCustomer = await prisma.user.update({
        data: {
          balance: customer.balance + amount,
        },
        where: {
          id: userId,
        },
      });

      const createdTransaction =
        await this.transactionsService.createTransaction({
          fromUserId: updatedCustomer.id,
          toUserId: updatedCustomer.id,
          type: TransactionType.DEPOSIT,
          amount,
        });

      return {
        performedUser: userModelToDto(updatedCustomer as UserModel),
        transaction: transactionModelToDto(
          createdTransaction as TransactionModel,
        ),
      };
    });

    return result;
  }

  /**
   * Withdraw
   */

  async withdrawFromAccount(
    userId: string,
    amount: number,
  ): Promise<WithdrawResponseDto> {
    if (amount <= 0) {
      throw new UnprocessableEntityException('Amount must be greater than 0');
    }

    const customer = await this.checkAndGetUserById(userId);

    if (customer.balance < amount) {
      throw new UnprocessableEntityException('Current balance is insufficient');
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const updatedCustomer = await prisma.user.update({
        data: {
          balance: customer.balance - amount,
        },
        where: {
          id: userId,
        },
      });

      const createdTransaction =
        await this.transactionsService.createTransaction({
          fromUserId: updatedCustomer.id,
          toUserId: updatedCustomer.id,
          type: TransactionType.WITHDRAW,
          amount,
        });

      return {
        performedUser: userModelToDto(updatedCustomer as UserModel),
        transaction: transactionModelToDto(
          createdTransaction as TransactionModel,
        ),
      };
    });

    return result;
  }

  /**
   * Transfer
   */

  async transferFromAccountToAccount(
    fromUserId: string,
    toUserId: string,
    amount: number,
  ): Promise<TransferResponseDto> {
    if (amount <= 0) {
      throw new UnprocessableEntityException('Amount must be greater than 0');
    }

    if (fromUserId === toUserId) {
      throw new UnprocessableEntityException(
        'Duplicated transfer from user and to user',
      );
    }

    const [fromCustomer, toCustomer] = await this.prisma.user.findMany({
      where: {
        id: { in: [fromUserId, toUserId] },
      },
    });

    if (!fromCustomer || !toCustomer) {
      throw new NotFoundException('One or both users are not found');
    }

    if (fromCustomer.balance < amount) {
      throw new UnprocessableEntityException('Current balance is insufficient');
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const fromUser = await prisma.user.update({
        where: {
          id: fromUserId,
        },
        data: {
          balance: fromCustomer.balance - amount,
        },
      });

      const toUser = await prisma.user.update({
        where: {
          id: toUserId,
        },
        data: {
          balance: toCustomer.balance + amount,
        },
      });

      const createdTransaction =
        await this.transactionsService.createTransaction({
          fromUserId: fromUser.id,
          toUserId: toUser.id,
          type: TransactionType.TRANSFER,
          amount,
        });

      return {
        performedUser: userModelToDto(fromUser as UserModel),
        transaction: transactionModelToDto(
          createdTransaction as TransactionModel,
        ),
      };
    });

    return result;
  }

  /**
   * Get user by id
   */

  private async checkAndGetUserById(userId: string): Promise<UserModel> {
    const targetUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    return targetUser as UserModel;
  }
}
