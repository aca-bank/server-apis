import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsPublic } from 'src/metadata/public.metadata';

import { SignInDto } from './auth.dtos';
import { AuthService } from './auth.service';
import { TokensResponse } from './auth.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  @HttpCode(HttpStatus.OK)
  signIn(@Body() payload: SignInDto) {
    return this.authService.signIn(payload);
  }
}
