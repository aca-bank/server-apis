import { PickType } from '@nestjs/mapped-types';
import { AccountModel } from 'src/models/account.model';
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

export class GetBalanceResponseDto extends PickType(AccountModel, [
  'balance',
]) {}

export class DepositResponseDto {
  account: AccountModel;
  transaction: TransactionModel;
}

export class WithdrawResponseDto {
  account: AccountModel;
  transaction: TransactionModel;
}

export class TransferResponseDto {
  sentAccount: AccountModel;
  receivedAccount: AccountModel;
  transaction: TransactionModel;
}
