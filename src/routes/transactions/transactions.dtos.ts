import { OmitType, PickType } from '@nestjs/mapped-types';
import { TransactionModel } from 'src/models/transaction.model';
import { OrderType } from 'src/types/order';

export class TransactionDto extends OmitType(TransactionModel, ['updatedAt']) {}

export class CreateTransactionRequestDto extends PickType(TransactionModel, [
  'fromUserId',
  'toUserId',
  'amount',
  'type',
]) {}

export type TransactionOrderQueryType = {
  type?: OrderType;
  amount?: OrderType;
  createdAt?: OrderType;
};
