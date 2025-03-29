import { Test } from '@nestjs/testing';
import {
  mockBankAccount1,
  mockBankAccount2,
  mockTransaction1,
  mockUser1,
  mockUser2,
} from 'src/utils/dummy';

import { BankAccountsController } from '../bank-accounts.controller';
import {
  DepositResponseDto,
  TransferResponseDto,
  WithdrawResponseDto,
} from '../bank-accounts.dto';
import { BankAccountsService } from '../bank-accounts.service';

describe('BankAccountsController', () => {
  let bankAccountsController: BankAccountsController;
  let bankAccountsService: BankAccountsService;

  const mockBankAccountsService = {
    deposit: jest.fn(),
    withdraw: jest.fn(),
    transfer: jest.fn(),
    getTotalBankAmount: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [BankAccountsController],
      providers: [
        {
          provide: BankAccountsService,
          useValue: mockBankAccountsService,
        },
      ],
    }).compile();

    bankAccountsController = module.get<BankAccountsController>(
      BankAccountsController,
    );
    bankAccountsService = module.get<BankAccountsService>(BankAccountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should deposit successfully', async () => {
    const mockDepositResponse: DepositResponseDto = {
      account: mockBankAccount1,
      transaction: mockTransaction1,
    };
    (bankAccountsService.deposit as jest.Mock).mockResolvedValueOnce(
      mockDepositResponse,
    );

    const result = await bankAccountsController.deposit(mockUser1.id, {
      amount: 100,
    });

    expect(result).toStrictEqual(mockDepositResponse);
  });

  it('should withdraw successfully', async () => {
    const mockWithdrawResponse: WithdrawResponseDto = {
      account: mockBankAccount1,
      transaction: mockTransaction1,
    };
    (bankAccountsService.withdraw as jest.Mock).mockResolvedValueOnce(
      mockWithdrawResponse,
    );

    const result = await bankAccountsController.withdraw(mockUser1.id, {
      amount: 100,
    });

    expect(result).toStrictEqual(mockWithdrawResponse);
  });

  it('should transfer successfully', async () => {
    const mockTransferResponse: TransferResponseDto = {
      sentAccount: mockBankAccount1,
      receivedAccount: mockBankAccount2,
      transaction: mockTransaction1,
    };
    (bankAccountsService.transfer as jest.Mock).mockResolvedValueOnce(
      mockTransferResponse,
    );

    const result = await bankAccountsController.transfer(
      mockUser1.id,
      mockUser2.id,
      {
        amount: 100,
      },
    );

    expect(result).toStrictEqual(mockTransferResponse);
  });

  it('should return total bank amount', async () => {
    (bankAccountsService.getTotalBankAmount as jest.Mock).mockResolvedValueOnce(
      1000,
    );

    const result = await bankAccountsController.getTotalBankAmount();

    expect(result).toStrictEqual(1000);
  });
});
