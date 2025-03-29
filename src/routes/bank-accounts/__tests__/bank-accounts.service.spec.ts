import {
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { SharedService } from 'src/routes/_shared/shared.service';
import { TransactionsService } from 'src/routes/transactions/transactions.service';
import {
  mockBankAccount1,
  mockTransaction1,
  mockUser1,
  mockUser2,
} from 'src/utils/dummy';

import { DepositResponseDto, WithdrawResponseDto } from '../bank-accounts.dto';
import { BankAccountsService } from '../bank-accounts.service';

describe('BankAccountsService', () => {
  let bankAccountsService: BankAccountsService;
  let prismaService: PrismaService;
  let sharedService: SharedService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let transactionsService: TransactionsService;

  const mockSharedService = {
    checkAndGetUserById: jest.fn(),
  };

  const mockTransactionsService = {
    createTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountsService,
        {
          provide: PrismaService,
          useValue: {
            bankAccount: {
              create: jest.fn(),
              update: jest.fn(),
              aggregate: jest.fn(),
            },
          },
        },
        {
          provide: SharedService,
          useValue: mockSharedService,
        },
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    bankAccountsService = module.get<BankAccountsService>(BankAccountsService);
    prismaService = module.get<PrismaService>(PrismaService);
    sharedService = module.get<SharedService>(SharedService);
    transactionsService = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('should throw error if then user already has a bank account', async () => {
      sharedService.checkAndGetUserById = jest.fn().mockResolvedValueOnce({
        account: mockBankAccount1,
      });

      try {
        await bankAccountsService.createAccount('user-01');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('This user already has a bank account');
      }
    });

    it('should create a bank account for user successfully', async () => {
      sharedService.checkAndGetUserById = jest.fn().mockResolvedValueOnce(null);
      prismaService.bankAccount.create = jest
        .fn()
        .mockResolvedValueOnce(mockBankAccount1);

      const result = await bankAccountsService.createAccount(
        mockBankAccount1.userId,
      );

      expect(result).toStrictEqual(mockBankAccount1);
    });
  });

  describe('getAccountBalance', () => {
    it('should return current balance of a customer successfully', async () => {
      sharedService.checkAndGetUserById = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);

      const result = await bankAccountsService.getAccountBalance(
        mockBankAccount1.userId,
      );
      expect(result.balance).toBe(mockUser1.account.balance);
    });
  });

  describe('deposit', () => {
    it('should throw error if the deposit amount is less or equal to 0', async () => {
      try {
        await bankAccountsService.deposit(mockUser1.id, 0);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Amount must be greater than 0');
      }
    });

    it('should deposit successfully', async () => {
      sharedService.checkAndGetUserById = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);
      const mockDepositResponse: DepositResponseDto = {
        account: mockBankAccount1,
        transaction: mockTransaction1,
      };
      prismaService.$transaction = jest
        .fn()
        .mockResolvedValueOnce(mockDepositResponse);

      const result = await bankAccountsService.deposit(mockUser1.id, 100);
      expect(result).toStrictEqual(mockDepositResponse);
    });
  });

  describe('withdraw', () => {
    it('should throw error if the withdraw amount is less or equal to 0', async () => {
      try {
        await bankAccountsService.withdraw(mockUser1.id, 0);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Amount must be greater than 0');
      }
    });

    it('should throw error if the withdraw amount is greater than current balance', async () => {
      sharedService.checkAndGetUserById = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);
      try {
        await bankAccountsService.withdraw(mockUser1.id, 200);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Current balance is insufficient');
      }
    });

    it('should withdraw successfully', async () => {
      sharedService.checkAndGetUserById = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);
      const mockWithdrawResponse: WithdrawResponseDto = {
        account: mockBankAccount1,
        transaction: mockTransaction1,
      };
      prismaService.$transaction = jest
        .fn()
        .mockResolvedValueOnce(mockWithdrawResponse);

      const result = await bankAccountsService.withdraw(mockUser1.id, 50);
      expect(result).toStrictEqual(mockWithdrawResponse);
    });
  });

  describe('transfer', () => {
    it('should throw error if the transfer amount is less or equal to 0', async () => {
      try {
        await bankAccountsService.transfer(mockUser1.id, mockUser2.id, 0);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Amount must be greater than 0');
      }
    });

    it('should throw error if the sent customer id and received customer id is the same', async () => {
      try {
        await bankAccountsService.transfer(mockUser1.id, mockUser1.id, 50);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe(
          'Duplicated transfer of sent user and received user',
        );
      }
    });

    it('should throw error if the transfer amount is greater than current balance', async () => {
      sharedService.checkAndGetUserById = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);
      try {
        await bankAccountsService.transfer(mockUser1.id, mockUser2.id, 300);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Current balance is insufficient');
      }
    });

    it('should transfer successfully', async () => {
      sharedService.checkAndGetUserById = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);
      const mockTransferResponse: WithdrawResponseDto = {
        account: mockUser1.account,
        transaction: mockTransaction1,
      };
      prismaService.$transaction = jest
        .fn()
        .mockResolvedValueOnce(mockTransferResponse);

      const result = await bankAccountsService.transfer(
        mockUser1.id,
        mockUser2.id,
        50,
      );
      expect(result).toStrictEqual(mockTransferResponse);
    });
  });
});
