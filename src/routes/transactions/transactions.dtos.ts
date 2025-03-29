import { PickType } from '@nestjs/mapped-types';
import { TransactionModel } from 'src/models/transaction.model';
import { OrderType } from 'src/types/order';

export class CreateTransactionRequestDto extends PickType(TransactionModel, [
  'sentAccountId',
  'receivedAccountId',
  'amount',
  'type',
]) {}

export type TransactionOrderQueryType = {
  type?: OrderType;
  amount?: OrderType;
  createdDate?: OrderType;
};
