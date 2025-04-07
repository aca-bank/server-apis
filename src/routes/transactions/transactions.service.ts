import {
  forwardRef,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/app/prisma/prisma.service';
import {
  TransactionModel,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from 'src/models/transaction.model';
import { normalizeOrderQuery } from 'src/utils/helpers';

import { SharedService } from '../_shared/shared.service';
import { BankAccountsService } from '../bank-accounts/bank-accounts.service';

import {
  ApproveTransactionsResponseDto,
  CreateDepoWithTransactionRequestDto,
  CreateTransferTransactionRequestDto,
  TransactionOrderQueryType,
  ValidateBeforeTransferParams,
  ValidateBeforeTransferReturn,
} from './transactions.dtos';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private sharedService: SharedService,
    @Inject(forwardRef(() => BankAccountsService))
    private bankAccountService: BankAccountsService,
  ) {}

  /**
   * Get all transactions across users
   */

  async getAllTransactions(
    orderQuery: TransactionOrderQueryType,
  ): Promise<TransactionModel[]> {
    const transactions = await this.prisma.transaction.findMany({
      orderBy: normalizeOrderQuery(orderQuery),
    });
    return transactions as TransactionModel[];
  }

  /**
   * Get transactions of a specific account of user
   */

  async getTransactionsByUserId(
    userId: string,
    orderQuery: TransactionOrderQueryType,
  ): Promise<TransactionModel[]> {
    const targetUser = await this.sharedService.checkAndGetUserById(userId);
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [
          { sentAccountId: targetUser.account.id },
          { receivedAccountId: targetUser.account.id },
        ],
      },
      orderBy: normalizeOrderQuery(orderQuery),
    });

    return transactions as TransactionModel[];
  }

  /**
   * Create Deposit or Withdraw transaction
   */

  async createDepoWithTransaction(
    payload: CreateDepoWithTransactionRequestDto,
  ): Promise<TransactionModel> {
    const createdTransaction = await this.prisma.transaction.create({
      data: {
        sentAccountId: payload.sentAccountId,
        amount: payload.amount,
        type: payload.type,
        status: TransactionStatusEnum.SUCCESS,
      },
    });

    return createdTransaction as TransactionModel;
  }

  /**
   * Create Transfer transaction
   */

  async validateBeforeTransfer(
    props: ValidateBeforeTransferParams,
  ): Promise<ValidateBeforeTransferReturn> {
    const { sentAccountId, receivedAccountId, amount } = props;
    if (amount <= 0) {
      throw new UnprocessableEntityException('Amount must be greater than 0');
    }

    if (sentAccountId === receivedAccountId) {
      throw new UnprocessableEntityException(
        'Duplicated transfer of sent user and received user',
      );
    }

    const sentUser =
      await this.sharedService.checkAndGetUserByAccountId(sentAccountId);
    const receivedUser =
      await this.sharedService.checkAndGetUserByAccountId(receivedAccountId);

    if (sentUser.account.balance < amount) {
      throw new UnprocessableEntityException('Current balance is insufficient');
    }

    return {
      sentUser,
      receivedUser,
    };
  }

  async createTransferTransaction(
    sentAccountId: string,
    transferInfo: CreateTransferTransactionRequestDto,
  ): Promise<TransactionModel> {
    const { receivedAccountId, amount, userNote } = transferInfo;
    await this.validateBeforeTransfer({
      sentAccountId,
      receivedAccountId,
      amount,
    });

    const createdTransaction = await this.prisma.transaction.create({
      data: {
        sentAccountId,
        receivedAccountId,
        amount,
        userNote,
        type: TransactionTypeEnum.TRANSFER,
        status: TransactionStatusEnum.PENDING,
      },
    });

    return createdTransaction as TransactionModel;
  }

  /**
   * Approve transactions
   */

  private async updateTransactionAfterApprove(props: {
    transactionId: string;
    status: TransactionStatusEnum;
    systemNote?: string;
  }) {
    const { transactionId, status, systemNote } = props;
    const updatedTransaction = await this.prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        status: status,
        systemNote,
      },
    });

    return updatedTransaction;
  }

  async approvePendingTransactions(
    transactionIds: string[],
  ): Promise<ApproveTransactionsResponseDto> {
    const successTransactions = [];
    const failedTransactions = [];

    const pendingTransactions = await this.prisma.transaction.findMany({
      where: {
        id: {
          in: transactionIds,
        },
      },
    });

    for (const loopingTransaction of pendingTransactions) {
      try {
        await this.bankAccountService.transfer({
          sentAccountId: loopingTransaction.sentAccountId,
          receivedAccountId: loopingTransaction.receivedAccountId,
          amount: loopingTransaction.amount,
        });

        const successTransaction = await this.updateTransactionAfterApprove({
          transactionId: loopingTransaction.id,
          status: TransactionStatusEnum.SUCCESS,
        });
        successTransactions.push(successTransaction);
      } catch (error) {
        const failedTransaction = await this.updateTransactionAfterApprove({
          transactionId: loopingTransaction.id,
          status: TransactionStatusEnum.FAILED,
          systemNote: JSON.stringify(error.message),
        });
        failedTransactions.push(failedTransaction);
      }
    }

    return {
      successTransactions,
      failedTransactions,
    };
  }
}
