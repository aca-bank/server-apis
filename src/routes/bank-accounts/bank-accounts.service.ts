import {
  forwardRef,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { OmitPrismaMiddlewareService } from 'src/app/prisma/prisma.types';
import { BankAccountModel } from 'src/models/bank-account.model';
import { TransactionTypeEnum } from 'src/models/transaction.model';

import { SharedService } from '../_shared/shared.service';
import { TransactionsService } from '../transactions/transactions.service';

import {
  DepositResponseDto,
  GetBalanceResponseDto,
  TransferParams,
  TransferResponseDto,
  WithdrawResponseDto,
} from './bank-accounts.dto';

@Injectable()
export class BankAccountsService {
  constructor(
    private prisma: PrismaService,
    private sharedService: SharedService,
    @Inject(forwardRef(() => TransactionsService))
    private transactionsService: TransactionsService,
  ) {}

  /**
   * Create account
   */

  async createAccount(props: {
    userId: string;
    prisma?: OmitPrismaMiddlewareService;
  }): Promise<BankAccountModel> {
    const { userId, prisma = this.prisma } = props;
    const createdAccount = await prisma.bankAccount.create({
      data: {
        userId,
      },
    });

    return createdAccount;
  }

  /**
   * Get current balance
   */

  async getAccountBalance(userId: string): Promise<GetBalanceResponseDto> {
    const targetUser = await this.sharedService.checkAndGetUserById(userId);
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

    const targetUser = await this.sharedService.checkAndGetUserById(userId);

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
        await this.transactionsService.createDepoWithTransaction({
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

    const targetUser = await this.sharedService.checkAndGetUserById(userId);

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
        await this.transactionsService.createDepoWithTransaction({
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

  async transfer({
    sentAccountId,
    receivedAccountId,
    amount,
  }: TransferParams): Promise<TransferResponseDto> {
    const { sentUser, receivedUser } =
      await this.transactionsService.validateBeforeTransfer({
        sentAccountId,
        receivedAccountId,
        amount,
      });

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

      return {
        sentAccount: updatedSentAccount,
        receivedAccount: updatedReceivedAccount,
      };
    });

    return result;
  }

  /**
   * Get total bank amount
   */

  async getTotalBankAmount(): Promise<number> {
    const totalBankAmount = await this.prisma.bankAccount.aggregate({
      _sum: {
        balance: true,
      },
    });

    return totalBankAmount._sum.balance;
  }
}
