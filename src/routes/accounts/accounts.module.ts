import { Module } from '@nestjs/common';

import { TransactionsModule } from '../transactions/transactions.module';

import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService],
  imports: [TransactionsModule],
  exports: [AccountsService],
})
export class AccountsModule {}
