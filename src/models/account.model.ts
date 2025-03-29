import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UserModel } from 'src/models/user.model';

import { TransactionModel } from './transaction.model';

export class AccountModel {
  @ApiProperty({
    description: 'Uuid',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Account balance',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  balance: number;

  @ApiProperty({
    description: 'Map to Id in user entity',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Map to user entity',
    type: UserModel,
  })
  user?: UserModel;

  @ApiProperty({
    description: 'For Deposit, Withdraw and Transfer transactions',
    type: [TransactionModel],
  })
  sentTransactions?: TransactionModel[];

  @ApiProperty({
    description: 'For Receive Transfer transactions',
    type: [TransactionModel],
  })
  receivedTransactions?: TransactionModel[];
}
