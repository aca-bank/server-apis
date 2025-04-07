import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { TransactionTypeEnum } from 'src/models/transaction.model';
import { SharedService } from 'src/routes/_shared/shared.service';
import { TransactionsService } from 'src/routes/transactions/transactions.service';
import {
  mockBankAccount1,
  mockBankAccount2,
  mockTransaction1,
  mockUser1,
  mockUser2,
} from 'src/utils/dummy';

import {
  DepositResponseDto,
  TransferResponseDto,
  WithdrawResponseDto,
} from '../bank-accounts.dto';
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

    prismaService.$transaction = jest
      .fn()
      .mockImplementation(async (callback) => {
        return await callback(prismaService);
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('should create a bank account for user successfully', async () => {
      prismaService.bankAccount.create = jest
        .fn()
        .mockResolvedValueOnce(mockBankAccount1);

      const result = await bankAccountsService.createAccount({
        userId: mockBankAccount1.userId,
      });

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
      const mockDepositAmount = 100;
      const mockDepositResponse: DepositResponseDto = {
        account: mockBankAccount1,
        transaction: mockTransaction1,
      };
      sharedService.checkAndGetUserById = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);
      prismaService.bankAccount.update = jest
        .fn()
        .mockResolvedValueOnce(mockBankAccount1);
      jest
        .spyOn(transactionsService, 'createTransaction')
        .mockResolvedValueOnce(mockTransaction1);

      const result = await bankAccountsService.deposit(
        mockUser1.id,
        mockDepositAmount,
      );

      expect(prismaService.bankAccount.update).toHaveBeenCalledWith({
        data: {
          balance: mockUser1.account.balance + mockDepositAmount,
        },
        where: {
          userId: mockUser1.id,
        },
      });
      expect(transactionsService.createTransaction).toHaveBeenCalledWith({
        sentAccountId: mockBankAccount1.id,
        type: TransactionTypeEnum.DEPOSIT,
        amount: mockDepositAmount,
      });
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
      const mockWithdrawAmount = 50;
      const mockWithdrawResponse: WithdrawResponseDto = {
        account: mockBankAccount1,
        transaction: mockTransaction1,
      };
      sharedService.checkAndGetUserById = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);
      prismaService.bankAccount.update = jest
        .fn()
        .mockResolvedValueOnce(mockBankAccount1);
      jest
        .spyOn(transactionsService, 'createTransaction')
        .mockResolvedValueOnce(mockTransaction1);

      const result = await bankAccountsService.withdraw(
        mockUser1.id,
        mockWithdrawAmount,
      );

      expect(prismaService.bankAccount.update).toHaveBeenCalledWith({
        data: {
          balance: mockUser1.account.balance - mockWithdrawAmount,
        },
        where: {
          userId: mockUser1.id,
        },
      });
      expect(transactionsService.createTransaction).toHaveBeenCalledWith({
        sentAccountId: mockBankAccount1.id,
        type: TransactionTypeEnum.WITHDRAW,
        amount: mockWithdrawAmount,
      });
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
      const mockTransferAmount = 50;
      const mockTransferResponse: TransferResponseDto = {
        sentAccount: mockBankAccount1,
        receivedAccount: mockBankAccount2,
        transaction: mockTransaction1,
      };
      sharedService.checkAndGetUserById = jest
        .fn()
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2);
      prismaService.bankAccount.update = jest
        .fn()
        .mockResolvedValueOnce(mockBankAccount1)
        .mockResolvedValueOnce(mockBankAccount2);
      jest
        .spyOn(transactionsService, 'createTransaction')
        .mockResolvedValueOnce(mockTransaction1);

      const result = await bankAccountsService.transfer(
        mockUser1.id,
        mockUser2.id,
        mockTransferAmount,
      );
      expect(result).toStrictEqual(mockTransferResponse);
    });
  });
});
