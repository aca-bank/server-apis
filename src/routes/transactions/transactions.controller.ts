import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/decorators/get-auth-user';
import { Rbac } from 'src/metadata/rbac.metadata';
import { TransactionModel } from 'src/models/transaction.model';
import { UserRoleEnum } from 'src/models/user.model';

import {
  ApproveTransactionsRequestDto,
  CreateTransferTransactionRequestDto,
  TransactionOrderQueryType,
} from './transactions.dtos';
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
   * Approve pending transactions
   * Perform by: Manager
   */

  @ApiOperation({
    summary: 'Approve pending transactions',
  })
  @ApiOkResponse({
    type: TransactionModel,
  })
  @Rbac(UserRoleEnum.MANAGER)
  @Post('/approve-transactions')
  approvePendingTransactions(@Body() payload: ApproveTransactionsRequestDto) {
    return this.transactionsService.approvePendingTransactions(
      payload.transactionIds,
    );
  }

  /**
   * Create a transfer transaction
   * Perform by: Customer
   */

  @ApiOperation({
    summary: 'Create a transfer transaction',
  })
  @ApiOkResponse({
    type: TransactionModel,
  })
  @Rbac(UserRoleEnum.CUSTOMER)
  @Post('/create-transfer')
  @HttpCode(HttpStatus.OK)
  createTransferTransaction(
    @AuthUser('accountId') accountId: string,
    @Body() payload: CreateTransferTransactionRequestDto,
  ) {
    return this.transactionsService.createTransferTransaction(
      accountId,
      payload,
    );
  }

  /**
   * Get transaction history of the signed user
   * Perform by: Customer
   */

  @ApiOperation({
    summary: 'Get transaction history of the signed user',
  })
  @ApiOkResponse({
    type: [TransactionModel],
  })
  @Rbac(UserRoleEnum.CUSTOMER)
  @Get('/customer')
  @HttpCode(HttpStatus.OK)
  getAuthUserTransactions(
    @AuthUser('userId') userId: string,
    @Query() orderQuery: TransactionOrderQueryType,
  ) {
    return this.transactionsService.getTransactionsByUserId(userId, orderQuery);
  }
}
