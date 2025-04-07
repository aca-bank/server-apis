import { PickType } from '@nestjs/mapped-types';
import { BankAccountModel } from 'src/models/bank-account.model';
import { TransactionModel } from 'src/models/transaction.model';

/**
 * Request Dto
 */

export class AmountRequestDto {
  amount: number;
}

/**
 * Response Dto
 */

export class GetBalanceResponseDto extends PickType(BankAccountModel, [
  'balance',
]) {}

export class DepositResponseDto {
  account: BankAccountModel;
  transaction: TransactionModel;
}

export class WithdrawResponseDto {
  account: BankAccountModel;
  transaction: TransactionModel;
}

/**
 * Transfer
 */

export class TransferParams {
  sentAccountId: string;
  receivedAccountId: string;
  amount: number;
}

export class TransferResponseDto {
  sentAccount: BankAccountModel;
  receivedAccount: BankAccountModel;
}
