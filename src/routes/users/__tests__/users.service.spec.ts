import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { BankAccountsService } from 'src/routes/bank-accounts/bank-accounts.service';
import { mockBankAccount1, mockUser1 } from 'src/utils/dummy';

import { UsersService } from '../users.service';
import { CreateUserRequestDto } from '../users.dtos';

jest.mock('src/utils/helpers');

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;
  let bankAccountsService: BankAccountsService;

  const mockBankAccountsService = {
    createAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: BankAccountsService,
          useValue: mockBankAccountsService,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    bankAccountsService = module.get<BankAccountsService>(BankAccountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should throw error if the username is existed', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);

      try {
        await usersService.createCustomer(mockUser1);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Username is existed');
      }
    });

    it('should create customer with a bank account successfully', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValueOnce(null);
      prismaService.user.create = jest.fn().mockResolvedValueOnce(mockUser1);
      bankAccountsService.createAccount = jest
        .fn()
        .mockResolvedValueOnce(mockBankAccount1);

      const customerRequest: CreateUserRequestDto = {
        username: mockUser1.username,
        password: mockUser1.password,
        name: mockUser1.name,
      };
      const createdCustomer =
        await usersService.createCustomer(customerRequest);

      expect(createdCustomer).toStrictEqual(mockUser1);
      expect(createdCustomer.account).toStrictEqual(mockBankAccount1);
    });
  });

  describe('createManager', () => {
    it('should throw error if the username is existed', async () => {
      const mockManager = {
        ...mockUser1,
        account: undefined,
      };
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockManager);

      try {
        await usersService.createManager(mockManager);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Username is existed');
      }
    });

    it('should create Manager successfully', async () => {
      const mockManager = {
        ...mockUser1,
        account: undefined,
      };
      prismaService.user.findUnique = jest.fn().mockResolvedValueOnce(null);
      prismaService.user.create = jest.fn().mockResolvedValueOnce(mockManager);

      const managerRequest: CreateUserRequestDto = {
        username: mockUser1.username,
        password: mockUser1.password,
        name: mockUser1.name,
      };
      const createdManager = await usersService.createManager(managerRequest);

      expect(createdManager).toStrictEqual(mockManager);
      expect(createdManager.account).toBeUndefined();
    });
  });
});
