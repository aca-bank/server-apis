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
import { AuthUser } from 'src/decorators/get-auth-user';
import { Rbac } from 'src/metadata/rbac.metadata';
import { UserRoleEnum } from 'src/models/user.model';

import {
  AmountRequestDto,
  DepositResponseDto,
  GetBalanceResponseDto,
  TransferResponseDto,
  WithdrawResponseDto,
} from './bank-accounts.dto';
import { BankAccountsService } from './bank-accounts.service';

@ApiTags('accounts')
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private bankAccountsService: BankAccountsService) {}

  /**
   * Get current balance
   */

  @ApiOperation({
    description: 'Get current balance',
  })
  @ApiOkResponse({
    type: GetBalanceResponseDto,
  })
  @Rbac(UserRoleEnum.CUSTOMER)
  @Get('/balance')
  @HttpCode(HttpStatus.OK)
  getBalance(@AuthUser('userId') userId: string) {
    return this.bankAccountsService.getBalance(userId);
  }

  /**
   * Deposit to account
   */

  @ApiOperation({
    summary: 'Deposit to account',
  })
  @ApiOkResponse({
    type: DepositResponseDto,
  })
  @Rbac(UserRoleEnum.CUSTOMER)
  @Put('/deposit')
  depositToAccount(
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
  withdrawFromAccount(
    @AuthUser('userId') userId: string,
    @Body() payload: AmountRequestDto,
  ) {
    return this.bankAccountsService.withdraw(userId, payload.amount);
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
    name: 'receiveUserId',
    type: String,
  })
  @Rbac(UserRoleEnum.CUSTOMER)
  @Put('/transfer/:receiveUserId')
  transferFromAccountToAccount(
    @AuthUser('userId') sendUserId: string,
    @Param('receiveUserId') receiveUserId: string,
    @Body() payload: AmountRequestDto,
  ) {
    return this.bankAccountsService.transfer(
      sendUserId,
      receiveUserId,
      payload.amount,
    );
  }
}
