import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/app/prisma/prisma.service';
import {
  TransactionModel,
  TransactionType,
} from 'src/models/transaction.model';
import { UserRole } from 'src/models/user.model';
import { TransactionsService } from 'src/routes/transactions/transactions.service';

import {
  DepositResponseDto,
  UserDto,
  WithdrawResponseDto,
} from '../users.dtos';
import { UsersService } from '../users.service';

const mockUser1 = {
  id: 'c1-012345',
  username: 'customer-1',
  password: '1111',
  name: 'Customer 1',
  balance: 100,
  role: UserRole.CUSTOMER,
};

const mockUser2 = {
  id: 'c2-012345',
  username: 'customer-2',
  password: '1111',
  name: 'Customer 2',
  balance: 100,
  role: UserRole.CUSTOMER,
};

const mockTransaction = {
  id: 't1-123456',
  fromUserId: mockUser1.id,
  toUserId: mockUser2.id,
  amount: 100,
  type: TransactionType.DEPOSIT,
  createdAt: new Date(),
};

describe('UsersService', () => {
  let usersService: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let transactionsService: TransactionsService;
  let prismaService: PrismaService;

  const mockTransactionsService = {
    createTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              $transaction: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    transactionsService = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should throw error if the user is not existed', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValueOnce(null);

      try {
        await usersService.getBalance(mockUser1.id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
      }
    });

    it('should return current balance of a customer successfully', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);

      const result = await usersService.getBalance(mockUser1.id);
      expect(result.balance).toBe(mockUser1.balance);
    });
  });

  describe('depositToAccount', () => {
    it('should throw error if the deposit amount is less or equal to 0', async () => {
      try {
        await usersService.depositToAccount(mockUser1.id, 0);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Amount must be greater than 0');
      }
    });

    it('should throw error if the user is not existed', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValueOnce(null);

      try {
        await usersService.depositToAccount(mockUser1.id, 100);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
      }
    });

    it('should deposit successfully', async () => {
      const mockDepositResponse: DepositResponseDto = {
        performedUser: mockUser1 as UserDto,
        transaction: mockTransaction as TransactionModel,
      };
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);
      prismaService.$transaction = jest
        .fn()
        .mockResolvedValueOnce(mockDepositResponse);

      const result = await usersService.depositToAccount(mockUser1.id, 100);
      expect(result).toStrictEqual(mockDepositResponse);
    });
  });

  describe('withdrawFromAccount', () => {
    it('should throw error if the withdraw amount is less or equal to 0', async () => {
      try {
        await usersService.withdrawFromAccount(mockUser1.id, 0);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Amount must be greater than 0');
      }
    });

    it('should throw error if the user is not existed', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValueOnce(null);

      try {
        await usersService.withdrawFromAccount(mockUser1.id, 100);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
      }
    });

    it('should throw error if the withdraw amount is greater than current balance', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);
      try {
        await usersService.withdrawFromAccount(mockUser1.id, 200);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Current balance is insufficient');
      }
    });

    it('should withdraw successfully', async () => {
      const mockWithdrawResponse: WithdrawResponseDto = {
        performedUser: mockUser1 as UserDto,
        transaction: mockTransaction as TransactionModel,
      };
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);
      prismaService.$transaction = jest
        .fn()
        .mockResolvedValueOnce(mockWithdrawResponse);

      const result = await usersService.withdrawFromAccount(mockUser1.id, 100);
      expect(result).toStrictEqual(mockWithdrawResponse);
    });
  });

  describe('transferFromAccountToAccount', () => {
    it('should throw error if the transfer amount is less or equal to 0', async () => {
      try {
        await usersService.transferFromAccountToAccount(
          mockUser1.id,
          mockUser2.id,
          0,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Amount must be greater than 0');
      }
    });

    it('should throw error if the from user id and to user id is the same', async () => {
      try {
        await usersService.transferFromAccountToAccount(
          mockUser1.id,
          mockUser1.id,
          50,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Duplicated transfer from user and to user');
      }
    });

    it('should throw error if the from user or to user is not existed', async () => {
      prismaService.user.findMany = jest.fn().mockResolvedValueOnce([]);

      try {
        await usersService.transferFromAccountToAccount(
          mockUser1.id,
          mockUser2.id,
          50,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('One or both users are not found');
      }
    });

    it('should throw error if the transfer amount is greater than current balance', async () => {
      prismaService.user.findMany = jest
        .fn()
        .mockResolvedValueOnce([mockUser1, mockUser2]);
      try {
        await usersService.transferFromAccountToAccount(
          mockUser1.id,
          mockUser2.id,
          300,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Current balance is insufficient');
      }
    });

    it('should transfer successfully', async () => {
      const mockTransferResponse: WithdrawResponseDto = {
        performedUser: mockUser1 as UserDto,
        transaction: mockTransaction as TransactionModel,
      };
      prismaService.user.findMany = jest
        .fn()
        .mockResolvedValueOnce([mockUser1, mockUser2]);
      prismaService.$transaction = jest
        .fn()
        .mockResolvedValueOnce(mockTransferResponse);

      const result = await usersService.transferFromAccountToAccount(
        mockUser1.id,
        mockUser2.id,
        50,
      );
      expect(result).toStrictEqual(mockTransferResponse);
    });
  });
});
