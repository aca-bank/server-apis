import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';

import { BankAccountModel } from './bank-account.model';

export enum UserRoleEnum {
  CUSTOMER = 'CUSTOMER',
  MANAGER = 'MANAGER',
}

export class UserModel {
  @ApiProperty({
    description: 'Uuid',
    type: String,
  })
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Username for sign in',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Password of sign in',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Full name of user',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Role for user',
    type: String,
    enum: UserRoleEnum,
  })
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    description: 'Account info for customer role',
    type: () => BankAccountModel,
  })
  account?: BankAccountModel;

  @ApiProperty({
    description: 'Activate status of user',
  })
  @IsBoolean()
  activated?: boolean;

  @IsDate()
  createdDate?: Date;

  @IsDate()
  updatedDate?: Date;
}
