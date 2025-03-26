import { Test } from '@nestjs/testing';
import { TransactionType } from 'src/models/transaction.model';

import { TransactionsController } from '../transactions.controller';
import { TransactionOrderQueryType } from '../transactions.dtos';
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

describe('TransactionController', () => {
  let transactionsController: TransactionsController;
  let transactionsService: TransactionsService;

  const mockTransactionService = {
    getAllTransactionHistory: jest.fn(),
    getTransactionHistoryByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    transactionsController = module.get<TransactionsController>(
      TransactionsController,
    );
    transactionsService = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all transactions history across customers', async () => {
    (
      transactionsService.getAllTransactionHistory as jest.Mock
    ).mockResolvedValueOnce([mockTransaction1, mockTransaction2]);

    const result =
      await transactionsController.getAllTransactionHistory(mockOrderQuery);

    expect(result).toStrictEqual([mockTransaction1, mockTransaction2]);
    expect(transactionsService.getAllTransactionHistory).toHaveBeenCalledWith(
      mockOrderQuery,
    );
  });

  it('should return all transactions history by a specific userId', async () => {
    const mockUserId = 'user-01';
    (
      transactionsService.getTransactionHistoryByUserId as jest.Mock
    ).mockResolvedValueOnce([mockTransaction1, mockTransaction2]);

    const result = await transactionsController.getTransactionHistoryByUserId(
      mockUserId,
      mockOrderQuery,
    );

    expect(result).toStrictEqual([mockTransaction1, mockTransaction2]);
    expect(
      transactionsService.getTransactionHistoryByUserId,
    ).toHaveBeenCalledWith(mockUserId, mockOrderQuery);
  });
});
