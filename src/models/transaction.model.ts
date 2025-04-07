import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { BankAccountModel } from './bank-account.model';

export enum TransactionTypeEnum {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER',
}

export enum TransactionStatusEnum {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export class TransactionModel {
  @ApiProperty({
    description: 'Random id',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  id?: string;

  @ApiProperty({
    description: 'Types of transaction',
    enum: TransactionTypeEnum,
    example: TransactionTypeEnum.DEPOSIT,
  })
  @IsNotEmpty()
  type: TransactionTypeEnum;

  @ApiProperty({
    description: 'Amount of transaction',
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Status of transaction',
  })
  @IsNotEmpty()
  status: TransactionStatusEnum;

  @ApiProperty({
    description: 'Mapping to Id in Account entity',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  sentAccountId: string;

  @ApiProperty({
    description: 'Mapping to Account entity for Deposit, Withdraw and Transfer',
    type: BankAccountModel,
  })
  sentAccount?: BankAccountModel;

  @ApiProperty({
    description: 'Mapping to Id in Account entity for Receive Transfer',
    type: String,
  })
  @IsString()
  receivedAccountId?: string;

  @ApiProperty({
    description: 'Mapping to Account entity for Receive Transfer',
    type: BankAccountModel,
  })
  receivedAccount?: BankAccountModel;

  @ApiProperty({
    description: 'Note for user',
    type: String,
  })
  @IsString()
  userNote?: string;

  @ApiProperty({
    description: 'System for user',
    type: String,
  })
  @IsString()
  systemNote?: string;

  @IsDate()
  createdDate?: Date;
}
