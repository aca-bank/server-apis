import { UserModel } from 'src/models/user.model';

import { UserDto } from './users.dtos';

export const userModelToDto = (model: UserModel): UserDto => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, createdAt, updatedAt, ...restProps } = model;
  return restProps;
};
