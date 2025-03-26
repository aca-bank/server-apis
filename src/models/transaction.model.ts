import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { UserModel } from './user.model';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER',
}

export class TransactionModel {
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fromUserId: string;

  @ApiProperty()
  @IsNotEmpty()
  fromUser: UserModel;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  type: TransactionType;

  @IsDate()
  createdAt?: Date;

  @IsDate()
  updatedAt?: Date;
}
