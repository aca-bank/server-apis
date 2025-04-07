import { BankAccountModel } from 'src/models/bank-account.model';
import {
  TransactionModel,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from 'src/models/transaction.model';
import { UserModel, UserRoleEnum } from 'src/models/user.model';

/**
 * Transactions
 */

export const mockTransaction1: TransactionModel = {
  type: TransactionTypeEnum.DEPOSIT,
  amount: 100,
  sentAccountId: 'bank-account-01',
  status: TransactionStatusEnum.SUCCESS,
};

export const mockTransaction2: TransactionModel = {
  type: TransactionTypeEnum.DEPOSIT,
  amount: 100,
  sentAccountId: 'bank-account-02',
  status: TransactionStatusEnum.SUCCESS,
};

/**
 * Bank Accounts
 */

export const mockBankAccount1: BankAccountModel = {
  balance: 100,
  userId: 'user-id-01',
};

export const mockBankAccount2: BankAccountModel = {
  balance: 50,
  userId: 'user-id-02',
};

/**
 * Users
 */

export const mockUser1: UserModel = {
  id: 'user-id-01',
  username: 'user-01',
  password: 'password',
  name: 'User 01',
  role: UserRoleEnum.CUSTOMER,
  account: mockBankAccount1,
  activated: true,
};

export const mockUser2: UserModel = {
  id: 'user-id-02',
  username: 'user-02',
  password: 'password',
  name: 'User 02',
  role: UserRoleEnum.CUSTOMER,
  account: mockBankAccount2,
  activated: true,
};
