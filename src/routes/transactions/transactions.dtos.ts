import { PickType } from '@nestjs/mapped-types';
import { TransactionModel } from 'src/models/transaction.model';
import { UserModel } from 'src/models/user.model';
import { OrderType } from 'src/types/order';

export type TransactionOrderQueryType = {
  type?: OrderType;
  amount?: OrderType;
  createdDate?: OrderType;
};

export class CreateDepoWithTransactionRequestDto extends PickType(
  TransactionModel,
  ['sentAccountId', 'amount', 'type'],
) {}

export class CreateTransferTransactionRequestDto extends PickType(
  TransactionModel,
  ['receivedAccountId', 'amount', 'userNote'],
) {}

export class ApproveTransactionsRequestDto {
  transactionIds: string[];
}

export class ApproveTransactionsResponseDto {
  successTransactions: TransactionModel[];
  failedTransactions: TransactionModel[];
}

export class ValidateBeforeTransferParams {
  sentAccountId: string;
  receivedAccountId: string;
  amount: number;
}

export class ValidateBeforeTransferReturn {
  sentUser: UserModel;
  receivedUser: UserModel;
}
