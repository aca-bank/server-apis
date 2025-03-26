import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from 'src/decorators/get-header-user';
import { Rbac } from 'src/metadata/rbac.metadata';
import { UserRole } from 'src/models/user.model';

import {
  DepositResponseDto,
  ChangeAmountRequestDto,
  GetBalanceResponseDto,
  TransferResponseDto,
  WithdrawResponseDto,
} from './users.dtos';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Get current balance of a specific customer
   * Perform by: Manager
   */

  @ApiOperation({
    summary: 'Get current balance of a specific customer',
  })
  @ApiOkResponse({
    type: GetBalanceResponseDto,
  })
  @ApiParam({
    name: 'userId',
    type: String,
  })
  @Rbac(UserRole.MANAGER)
  @Get('/balance/:userId')
  @HttpCode(HttpStatus.OK)
  getCustomerBalance(@Param('userId') userId: string) {
    return this.usersService.getBalance(userId);
  }

  /**
   * Get current balance
   * Perform by: Customer
   */

  @ApiOperation({
    summary: 'Get current balance',
  })
  @ApiOkResponse({
    type: GetBalanceResponseDto,
  })
  @Rbac(UserRole.CUSTOMER)
  @Get('/balance')
  @HttpCode(HttpStatus.OK)
  getCurrentBalance(@AuthUser('userId') userId: string) {
    return this.usersService.getBalance(userId);
  }

  /**
   * Deposit to account
   * Perform by: Customer
   */

  @ApiOperation({
    summary: 'Deposit to account',
  })
  @ApiOkResponse({
    type: DepositResponseDto,
  })
  @Rbac(UserRole.CUSTOMER)
  @Put('/deposit')
  depositToAccount(
    @AuthUser('userId') userId: string,
    @Body() payload: ChangeAmountRequestDto,
  ) {
    return this.usersService.depositToAccount(userId, payload.amount);
  }

  /**
   * Withdraw to account
   * Perform by: Customer
   */

  @ApiOperation({
    summary: 'Withdraw from account',
  })
  @ApiOkResponse({
    type: WithdrawResponseDto,
  })
  @Rbac(UserRole.CUSTOMER)
  @Put('/withdraw')
  withdrawFromAccount(
    @AuthUser('userId') userId: string,
    @Body() payload: ChangeAmountRequestDto,
  ) {
    return this.usersService.withdrawFromAccount(userId, payload.amount);
  }

  /**
   * Transfer from account to account
   * Perform by: Customer
   */

  @ApiOperation({
    summary: 'Transfer from account to account',
  })
  @ApiOkResponse({
    type: TransferResponseDto,
  })
  @ApiParam({
    name: 'toUserId',
    type: String,
  })
  @Rbac(UserRole.CUSTOMER)
  @Put('/transfer/:toUserId')
  transferFromAccountToAccount(
    @AuthUser('userId') fromUserId: string,
    @Param('toUserId') toUserId: string,
    @Body() payload: ChangeAmountRequestDto,
  ) {
    return this.usersService.transferFromAccountToAccount(
      fromUserId,
      toUserId,
      payload.amount,
    );
  }
}
