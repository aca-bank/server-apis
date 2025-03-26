import { TransactionModel } from 'src/models/transaction.model';

import { TransactionDto } from './transactions.dtos';

export const transactionModelToDto = (
  model: TransactionModel,
): TransactionDto => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updatedAt, ...restProps } = model;
  return restProps;
};
