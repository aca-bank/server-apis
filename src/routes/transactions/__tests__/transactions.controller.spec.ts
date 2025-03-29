import { Test } from '@nestjs/testing';
import { mockTransaction1, mockTransaction2, mockUser1 } from 'src/utils/dummy';

import { TransactionsController } from '../transactions.controller';
import { TransactionOrderQueryType } from '../transactions.dtos';
import { TransactionsService } from '../transactions.service';

const mockOrderQuery: TransactionOrderQueryType = {
  amount: 'asc',
};

describe('TransactionController', () => {
  let transactionsController: TransactionsController;
  let transactionsService: TransactionsService;

  const mockTransactionService = {
    getAllTransactions: jest.fn(),
    getTransactionsByUserId: jest.fn(),
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
    (transactionsService.getAllTransactions as jest.Mock).mockResolvedValueOnce(
      [mockTransaction1, mockTransaction2],
    );

    const result =
      await transactionsController.getAllTransactions(mockOrderQuery);

    expect(result).toStrictEqual([mockTransaction1, mockTransaction2]);
    expect(transactionsService.getAllTransactions).toHaveBeenCalledWith(
      mockOrderQuery,
    );
  });

  it('should return all transactions by a specific userId', async () => {
    (
      transactionsService.getTransactionsByUserId as jest.Mock
    ).mockResolvedValueOnce([mockTransaction1, mockTransaction2]);

    const result = await transactionsController.getAuthUserTransactions(
      mockUser1.id,
      mockOrderQuery,
    );

    expect(result).toStrictEqual([mockTransaction1, mockTransaction2]);
    expect(transactionsService.getTransactionsByUserId).toHaveBeenCalledWith(
      mockUser1.id,
      mockOrderQuery,
    );
  });
});
