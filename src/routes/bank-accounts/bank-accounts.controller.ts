import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/decorators/get-auth-user';
import { Rbac } from 'src/metadata/rbac.metadata';
import { UserRoleEnum } from 'src/models/user.model';

import {
  AmountRequestDto,
  DepositResponseDto,
  GetBalanceResponseDto,
  WithdrawResponseDto,
} from './bank-accounts.dto';
import { BankAccountsService } from './bank-accounts.service';

@ApiTags('accounts')
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private bankAccountsService: BankAccountsService) {}

  /**
   * Get total bank amount
   * Perform by: Manager
   */

  @ApiOperation({
    description: 'Get total bank amount',
  })
  @ApiOkResponse({
    type: Number,
  })
  @Rbac(UserRoleEnum.MANAGER)
  @Get('/total-bank-amount')
  @HttpCode(HttpStatus.OK)
  getTotalBankAmount() {
    return this.bankAccountsService.getTotalBankAmount();
  }

  /**
   * Get current account balance
   * Perform by: Customer
   */

  @ApiOperation({
    description: 'Get current account balance',
  })
  @ApiOkResponse({
    type: GetBalanceResponseDto,
  })
  @Rbac(UserRoleEnum.CUSTOMER)
  @Get('/balance')
  @HttpCode(HttpStatus.OK)
  getAccountBalance(@AuthUser('userId') userId: string) {
    return this.bankAccountsService.getAccountBalance(userId);
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
  @Rbac(UserRoleEnum.CUSTOMER)
  @Put('/deposit')
  deposit(
    @AuthUser('userId') userId: string,
    @Body() payload: AmountRequestDto,
  ) {
    return this.bankAccountsService.deposit(userId, payload.amount);
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
  @Rbac(UserRoleEnum.CUSTOMER)
  @Put('/withdraw')
  withdraw(
    @AuthUser('userId') userId: string,
    @Body() payload: AmountRequestDto,
  ) {
    return this.bankAccountsService.withdraw(userId, payload.amount);
  }
}
