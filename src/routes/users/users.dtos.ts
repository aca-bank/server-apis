import { OmitType, PickType } from '@nestjs/mapped-types';
import { UserModel } from 'src/models/user.model';

export class UserDto extends OmitType(UserModel, [
  'password',
  'createdDate',
  'updatedDate',
]) {}

/**
 * Request Dto
 */

export class CreateUserRequestDto extends PickType(UserModel, [
  'username',
  'password',
  'name',
] as const) {}

/**
 * Response Dto
 */
