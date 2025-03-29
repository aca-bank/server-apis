import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { TransactionModel } from 'src/models/transaction.model';
import { normalizeOrderQuery } from 'src/utils/helpers';

import { SharedService } from '../_shared/shared.service';

import {
  CreateTransactionRequestDto,
  TransactionOrderQueryType,
} from './transactions.dtos';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private sharedService: SharedService,
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
   * Create transaction
   */

  async createTransaction(
    payload: CreateTransactionRequestDto,
  ): Promise<TransactionModel> {
    const createdTransaction = await this.prisma.transaction.create({
      data: {
        sentAccountId: payload.sentAccountId,
        receivedAccountId: payload.receivedAccountId,
        amount: payload.amount,
        type: payload.type,
      },
    });

    return createdTransaction as TransactionModel;
  }
}
