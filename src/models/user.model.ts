import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { TransactionModel } from './transaction.model';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  MANAGER = 'MANAGER',
}

export class UserModel {
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  balance: number;

  @ApiProperty()
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty()
  transactions?: TransactionModel[];

  @IsDate()
  createdAt?: Date;

  @IsDate()
  updatedAt?: Date;
}
