import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/app/prisma/prisma.service';
import {
  TransactionModel,
  TransactionType,
} from 'src/models/transaction.model';

import {
  CreateTransactionRequestDto,
  TransactionOrderQueryType,
} from '../transactions.dtos';
import { TransactionsService } from '../transactions.service';

const mockTransaction1 = {
  id: 't1-123456',
  fromUserId: 'from-user-1',
  toUserId: 'to-user-1',
  amount: 100,
  type: TransactionType.DEPOSIT,
  createdAt: new Date(),
};

const mockTransaction2 = {
  id: 't2-123456',
  fromUserId: 'from-user-2',
  toUserId: 'to-user-2',
  amount: 100,
  type: TransactionType.DEPOSIT,
  createdAt: new Date(),
};

const mockOrderQuery: TransactionOrderQueryType = {
  amount: 'asc',
};

describe('TransactionService', () => {
  let transactionsService: TransactionsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: {
            transaction: {
              findMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    transactionsService = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTransactionHistory', () => {
    it('should return all transactions history across customers', async () => {
      prismaService.transaction.findMany = jest
        .fn()
        .mockResolvedValueOnce([mockTransaction1, mockTransaction2]);

      const result =
        await transactionsService.getAllTransactionHistory(mockOrderQuery);
      expect(result).toStrictEqual([mockTransaction1, mockTransaction2]);
    });
  });

  describe('getTransactionHistoryByUserId', () => {
    it('should return all transactions history by a specific userId', async () => {
      const mockUserId = 'user-01';
      prismaService.transaction.findMany = jest
        .fn()
        .mockResolvedValueOnce([mockTransaction1, mockTransaction2]);

      const result = await transactionsService.getTransactionHistoryByUserId(
        mockUserId,
        mockOrderQuery,
      );
      expect(result).toStrictEqual([mockTransaction1, mockTransaction2]);
    });
  });

  describe('createTransaction', () => {
    it('should create a Deposit, Withdraw or Transfer transaction successfully', async () => {
      const createTransactionRequest: CreateTransactionRequestDto = {
        fromUserId: 'user-01',
        toUserId: 'user-02',
        amount: 100,
        type: TransactionType.DEPOSIT,
      };
      const createdTransactionResponse: TransactionModel = {
        ...createTransactionRequest,
        id: 'transaction-01',
        fromUser: null,
      };
      prismaService.transaction.create = jest
        .fn()
        .mockResolvedValueOnce(createdTransactionResponse);

      const result = await transactionsService.createTransaction(
        createTransactionRequest,
      );
      expect(result).toStrictEqual(createdTransactionResponse);
    });
  });
});
