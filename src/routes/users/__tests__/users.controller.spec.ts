import { Test } from '@nestjs/testing';
import {
  TransactionModel,
  TransactionType,
} from 'src/models/transaction.model';
import { UserRole } from 'src/models/user.model';

import { UsersController } from '../users.controller';
import { DepositResponseDto, UserDto } from '../users.dtos';
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

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    getBalance: jest.fn(),
    depositToAccount: jest.fn(),
    withdrawFromAccount: jest.fn(),
    transferFromAccountToAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get current balance of specific Customer by Manager', async () => {
    const mockGetBalanceResponse = {
      balance: mockUser1.balance,
    };
    (usersService.getBalance as jest.Mock).mockResolvedValueOnce(
      mockGetBalanceResponse,
    );

    const result = await usersController.getCustomerBalance(mockUser1.id);
    expect(result).toStrictEqual(mockGetBalanceResponse);
    expect(usersService.getBalance).toHaveBeenCalledWith(mockUser1.id);
  });

  it('should get current balance by Customer', async () => {
    const mockGetBalanceResponse = {
      balance: mockUser1.balance,
    };
    (usersService.getBalance as jest.Mock).mockResolvedValueOnce(
      mockGetBalanceResponse,
    );

    const result = await usersController.getCurrentBalance(mockUser1.id);
    expect(result).toStrictEqual(mockGetBalanceResponse);
    expect(usersService.getBalance).toHaveBeenCalledWith(mockUser1.id);
  });

  it('should deposit to account successfully', async () => {
    const mockDepositRequest = {
      amount: 50,
    };
    const mockDepositResponse: DepositResponseDto = {
      performedUser: mockUser1 as UserDto,
      transaction: mockTransaction as TransactionModel,
    };
    (usersService.depositToAccount as jest.Mock).mockResolvedValueOnce(
      mockDepositResponse,
    );

    const result = await usersController.depositToAccount(
      mockUser2.id,
      mockDepositRequest,
    );
    expect(result).toStrictEqual(mockDepositResponse);
    expect(usersService.depositToAccount).toHaveBeenCalledWith(
      mockUser2.id,
      mockDepositRequest.amount,
    );
  });

  it('should withdraw from account successfully', async () => {
    const mockWithdrawRequest = {
      amount: 50,
    };
    const mockWithdrawResponse: DepositResponseDto = {
      performedUser: mockUser1 as UserDto,
      transaction: mockTransaction as TransactionModel,
    };
    (usersService.withdrawFromAccount as jest.Mock).mockResolvedValueOnce(
      mockWithdrawResponse,
    );

    const result = await usersController.withdrawFromAccount(
      mockUser2.id,
      mockWithdrawRequest,
    );
    expect(result).toStrictEqual(mockWithdrawResponse);
    expect(usersService.withdrawFromAccount).toHaveBeenCalledWith(
      mockUser2.id,
      mockWithdrawRequest.amount,
    );
  });

  it('should transfer from account 1 to account 2 successfully', async () => {
    const mockTransferRequest = {
      amount: 50,
    };
    const mockTransferResponse: DepositResponseDto = {
      performedUser: mockUser1 as UserDto,
      transaction: mockTransaction as TransactionModel,
    };
    (
      usersService.transferFromAccountToAccount as jest.Mock
    ).mockResolvedValueOnce(mockTransferResponse);

    const result = await usersController.transferFromAccountToAccount(
      mockUser1.id,
      mockUser2.id,
      mockTransferRequest,
    );
    expect(result).toStrictEqual(mockTransferResponse);
    expect(usersService.transferFromAccountToAccount).toHaveBeenCalledWith(
      mockUser1.id,
      mockUser2.id,
      mockTransferRequest.amount,
    );
  });
});
