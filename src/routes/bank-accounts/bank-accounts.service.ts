import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { BankAccountModel } from 'src/models/bank-account.model';
import { TransactionTypeEnum } from 'src/models/transaction.model';
import { UserModel } from 'src/models/user.model';

import { TransactionsService } from '../transactions/transactions.service';

import {
  DepositResponseDto,
  GetBalanceResponseDto,
  TransferResponseDto,
  WithdrawResponseDto,
} from './bank-accounts.dto';

@Injectable()
export class BankAccountsService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
  ) {}

  /**
   * Create account
   */

  async createAccount(userId: string): Promise<BankAccountModel> {
    const targetUser = await this.checkAndGetUserById(userId);
    if (targetUser.account) {
      throw new ForbiddenException('This user already has balance account');
    }

    const createdAccount = await this.prisma.bankAccount.create({
      data: {
        userId,
      },
    });

    return createdAccount;
  }

  /**
   * Get current balance
   */

  async getBalance(userId: string): Promise<GetBalanceResponseDto> {
    const targetUser = await this.checkAndGetUserById(userId);
    return {
      balance: targetUser.account.balance,
    };
  }

  /**
   * Deposit
   */

  async deposit(userId: string, amount: number): Promise<DepositResponseDto> {
    if (amount <= 0) {
      throw new UnprocessableEntityException('Amount must be greater than 0');
    }

    const targetUser = await this.checkAndGetUserById(userId);

    const result = await this.prisma.$transaction(async (prisma) => {
      const updatedAccount = await prisma.bankAccount.update({
        data: {
          balance: targetUser.account.balance + amount,
        },
        where: {
          userId: targetUser.id,
        },
      });

      const createdTransaction =
        await this.transactionsService.createTransaction({
          sentAccountId: updatedAccount.id,
          type: TransactionTypeEnum.DEPOSIT,
          amount,
        });

      return {
        account: updatedAccount,
        transaction: createdTransaction,
      };
    });

    return result;
  }

  /**
   * Withdraw
   */

  async withdraw(userId: string, amount: number): Promise<WithdrawResponseDto> {
    if (amount <= 0) {
      throw new UnprocessableEntityException('Amount must be greater than 0');
    }

    const targetUser = await this.checkAndGetUserById(userId);

    if (targetUser.account.balance < amount) {
      throw new UnprocessableEntityException('Current balance is insufficient');
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const updatedAccount = await prisma.bankAccount.update({
        data: {
          balance: targetUser.account.balance - amount,
        },
        where: {
          userId: targetUser.id,
        },
      });

      const createdTransaction =
        await this.transactionsService.createTransaction({
          sentAccountId: updatedAccount.id,
          type: TransactionTypeEnum.WITHDRAW,
          amount,
        });

      return {
        account: updatedAccount,
        transaction: createdTransaction,
      };
    });

    return result;
  }

  /**
   * Transfer
   */

  async transfer(
    sentUserId: string,
    receivedUserId: string,
    amount: number,
  ): Promise<TransferResponseDto> {
    if (amount <= 0) {
      throw new UnprocessableEntityException('Amount must be greater than 0');
    }

    if (sentUserId === receivedUserId) {
      throw new UnprocessableEntityException(
        'Duplicated transfer of sent user and received user',
      );
    }

    const [sentUser, receivedUser] = await this.prisma.user.findMany({
      where: {
        id: { in: [sentUserId, receivedUserId] },
      },
      include: {
        account: true,
      },
    });

    if (!sentUser || !receivedUser) {
      throw new NotFoundException('One or both users are not existed');
    }

    if (sentUser.account.balance < amount) {
      throw new UnprocessableEntityException('Current balance is insufficient');
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const updatedSentAccount = await prisma.bankAccount.update({
        where: {
          userId: sentUser.id,
        },
        data: {
          balance: sentUser.account.balance - amount,
        },
      });

      const updatedReceivedAccount = await prisma.bankAccount.update({
        where: {
          userId: receivedUser.id,
        },
        data: {
          balance: receivedUser.account.balance + amount,
        },
      });

      const createdTransaction =
        await this.transactionsService.createTransaction({
          sentAccountId: updatedSentAccount.id,
          receivedAccountId: updatedReceivedAccount.id,
          type: TransactionTypeEnum.TRANSFER,
          amount,
        });

      return {
        sentAccount: updatedSentAccount,
        receivedAccount: updatedReceivedAccount,
        transaction: createdTransaction,
      };
    });

    return result;
  }

  /**
   * Check and get User by Id
   */

  private async checkAndGetUserById(userId: string): Promise<UserModel> {
    const foundUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        account: true,
      },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    return foundUser;
  }
}
