import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { TransactionModel } from 'src/models/transaction.model';
import { normalizeOrderQuery } from 'src/utils/helpers';

import {
  CreateTransactionRequestDto,
  TransactionOrderQueryType,
} from './transactions.dtos';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all transactions across users
   */

  async getAllTransactionHistory(
    orderQuery: TransactionOrderQueryType,
  ): Promise<TransactionModel[]> {
    const transactions = await this.prisma.transaction.findMany({
      orderBy: normalizeOrderQuery(orderQuery),
    });
    return transactions as TransactionModel[];
  }

  /**
   * Get transaction history of a specific customer
   */

  async getTransactionHistoryByUserId(
    userId: string,
    orderQuery: TransactionOrderQueryType,
  ): Promise<TransactionModel[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
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
      data: payload,
    });

    return createdTransaction as TransactionModel;
  }
}
