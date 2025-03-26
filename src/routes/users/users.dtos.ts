import { OmitType, PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { UserModel } from 'src/models/user.model';

import { TransactionDto } from '../transactions/transactions.dtos';

export class UserDto extends OmitType(UserModel, [
  'password',
  'createdAt',
  'updatedAt',
]) {}

/**
 * Request Dto
 */

export class CreateUserRequestDto extends PickType(UserModel, [
  'username',
  'password',
  'name',
  'balance',
] as const) {}

export class ChangeAmountRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

/**
 * Response Dto
 */

export class GetBalanceResponseDto extends PickType(UserModel, [
  'balance',
] as const) {}

export class DepositResponseDto {
  performedUser: UserDto;
  transaction: TransactionDto;
}

export class WithdrawResponseDto {
  performedUser: UserDto;
  transaction: TransactionDto;
}

export class TransferResponseDto {
  performedUser: UserDto;
  transaction: TransactionDto;
}
