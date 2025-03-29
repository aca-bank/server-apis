import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { TransactionModel } from 'src/models/transaction.model';
import { SharedService } from 'src/routes/_shared/shared.service';
import { mockTransaction1, mockTransaction2, mockUser1 } from 'src/utils/dummy';

import { TransactionOrderQueryType } from '../transactions.dtos';
import { TransactionsService } from '../transactions.service';

const mockOrderQuery: TransactionOrderQueryType = {
  amount: 'asc',
};

describe('TransactionService', () => {
  let transactionsService: TransactionsService;
  let prismaService: PrismaService;
  let sharedService: SharedService;

  const mockSharedService = {
    checkAndGetUserById: jest.fn(),
  };

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
        {
          provide: SharedService,
          useValue: mockSharedService,
        },
      ],
    }).compile();

    transactionsService = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get<PrismaService>(PrismaService);
    sharedService = module.get<SharedService>(SharedService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTransactions', () => {
    it('should return all transactions history across customers', async () => {
      prismaService.transaction.findMany = jest
        .fn()
        .mockResolvedValueOnce([mockTransaction1, mockTransaction2]);

      const result =
        await transactionsService.getAllTransactions(mockOrderQuery);
      expect(result).toStrictEqual([mockTransaction1, mockTransaction2]);
    });
  });

  describe('getTransactionsByUserId', () => {
    it('should return all transactions by a specific userId', async () => {
      sharedService.checkAndGetUserById = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);
      prismaService.transaction.findMany = jest
        .fn()
        .mockResolvedValueOnce([mockTransaction1, mockTransaction2]);

      const result = await transactionsService.getTransactionsByUserId(
        mockUser1.id,
        mockOrderQuery,
      );
      expect(result).toStrictEqual([mockTransaction1, mockTransaction2]);
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      const createdTransactionResponse: TransactionModel = {
        ...mockTransaction1,
        id: 'transaction-01',
        createdDate: new Date(),
      };
      prismaService.transaction.create = jest
        .fn()
        .mockResolvedValueOnce(createdTransactionResponse);

      const result =
        await transactionsService.createTransaction(mockTransaction1);
      expect(result).toStrictEqual(createdTransactionResponse);
    });
  });
});
