import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/decorators/get-header-user';
import { Rbac } from 'src/metadata/rbac.metadata';
import { TransactionModel } from 'src/models/transaction.model';
import { UserRole } from 'src/models/user.model';

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
  @Rbac(UserRole.MANAGER)
  @Get('/all')
  @HttpCode(HttpStatus.OK)
  getAllTransactionHistory(@Query() orderQuery: TransactionOrderQueryType) {
    return this.transactionsService.getAllTransactionHistory(orderQuery);
  }

  /**
   * Get transaction history of a specific customer
   * Perform by: Customer
   */

  @ApiOperation({
    summary: 'Get transaction history of a specific customer',
  })
  @ApiOkResponse({
    type: [TransactionModel],
  })
  @Rbac(UserRole.CUSTOMER)
  @Get('/customer')
  @HttpCode(HttpStatus.OK)
  getTransactionHistoryByUserId(
    @AuthUser('userId') userId: string,
    @Query() orderQuery: TransactionOrderQueryType,
  ) {
    return this.transactionsService.getTransactionHistoryByUserId(
      userId,
      orderQuery,
    );
  }
}
