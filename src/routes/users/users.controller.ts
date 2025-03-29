import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RestrictUserDataInterceptor } from 'src/interceptors/restrict-user.interceptor';
import { IsPublic } from 'src/metadata/public.metadata';

import { CreateUserRequestDto, UserDto } from './users.dtos';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Sign up for Customer
   */

  @ApiOperation({
    summary: 'Sign up customer account',
  })
  @ApiCreatedResponse({
    type: UserDto,
  })
  @Post('customer/sign-up')
  @IsPublic()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(RestrictUserDataInterceptor)
  signUpCustomer(@Body() userPayload: CreateUserRequestDto) {
    return this.usersService.createCustomer(userPayload);
  }

  /**
   * Sign up for manager
   */

  @ApiOperation({
    summary: 'Sign up manager account',
  })
  @ApiCreatedResponse({
    type: UserDto,
  })
  @Post('manager/sign-up')
  @IsPublic()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(RestrictUserDataInterceptor)
  signUpManager(@Body() userPayload: CreateUserRequestDto) {
    return this.usersService.createManager(userPayload);
  }
}
