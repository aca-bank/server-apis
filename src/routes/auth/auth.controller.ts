import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RestrictUserInterceptor } from 'src/interceptors/restrict-user.interceptor';
import { IsPublic } from 'src/metadata/public.metadata';
import { UserModel, UserRole } from 'src/models/user.model';

import { CreateUserRequestDto } from '../users/users.dtos';

import { SignInDto } from './auth.dtos';
import { AuthService } from './auth.service';
import { TokensResponse } from './auth.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Sign up for customer
   * Require: Provide initial deposit
   */

  @ApiOperation({
    summary: 'Create customer account',
  })
  @ApiCreatedResponse({
    type: UserModel,
  })
  @Post('create/customer')
  @IsPublic()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(RestrictUserInterceptor)
  signUpCustomer(@Body() userPayload: CreateUserRequestDto) {
    return this.authService.createUser(userPayload, UserRole.CUSTOMER);
  }

  /**
   * Sign up for manager
   */

  @ApiOperation({
    summary: 'Create manager account',
  })
  @ApiCreatedResponse({
    type: UserModel,
  })
  @Post('create/manager')
  @IsPublic()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(RestrictUserInterceptor)
  signUpManager(@Body() userPayload: CreateUserRequestDto) {
    return this.authService.createUser(userPayload, UserRole.MANAGER);
  }

  /**
   * Sign In
   */

  @ApiOperation({
    summary: 'Sign in to get accessToken and refreshToken',
  })
  @ApiOkResponse({
    type: TokensResponse,
  })
  @Post('signin')
  @IsPublic()
  @UseInterceptors(RestrictUserInterceptor)
  @HttpCode(HttpStatus.OK)
  signIn(@Body() payload: SignInDto) {
    return this.authService.signIn(payload);
  }
}
