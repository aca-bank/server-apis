import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/decorators/get-auth-user';
import { Rbac } from 'src/metadata/rbac.metadata';
import { TransactionModel } from 'src/models/transaction.model';
import { UserRoleEnum } from 'src/models/user.model';

import { TransactionOrderQueryType } from './transactions.dtos';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  /**
   * Get all transactions across users
   * Perform by: Manager
   */

  @ApiOperation({
    summary: 'Get all transactions across users',
  })
  @ApiOkResponse({
    type: [TransactionModel],
  })
  @Rbac(UserRoleEnum.MANAGER)
  @Get('/all')
  @HttpCode(HttpStatus.OK)
  getAllTransactions(@Query() orderQuery: TransactionOrderQueryType) {
    return this.transactionsService.getAllTransactions(orderQuery);
  }

  /**
   * Get transaction history of a specific customer
   * Perform by: Customer
   */

  @ApiOperation({
    summary: 'Get transactions of a specific user',
  })
  @ApiOkResponse({
    type: [TransactionModel],
  })
  @Rbac(UserRoleEnum.CUSTOMER)
  @Get('/customer')
  @HttpCode(HttpStatus.OK)
  getAuthUserTransactions(
    @AuthUser('accountId') accountId: string,
    @Query() orderQuery: TransactionOrderQueryType,
  ) {
    return this.transactionsService.getTransactionsByAccountId(
      accountId,
      orderQuery,
    );
  }
}
