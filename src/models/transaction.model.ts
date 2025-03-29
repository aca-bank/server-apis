import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { AccountModel } from './account.model';

export enum TransactionTypeEnum {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER',
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
    description: 'Mapping to Id in Account entity',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  sentAccountId: string;

  @ApiProperty({
    description: 'Mapping to Account entity for Deposit, Withdraw and Transfer',
    type: AccountModel,
  })
  sentAccount?: AccountModel;

  @ApiProperty({
    description: 'Mapping to Id in Account entity for Receive Transfer',
    type: String,
  })
  @IsString()
  receivedAccountId?: string;

  @ApiProperty({
    description: 'Mapping to Account entity for Receive Transfer',
    type: AccountModel,
  })
  receivedAccount?: AccountModel;

  @IsDate()
  createdDate?: Date;
}
