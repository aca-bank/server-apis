import { Module } from '@nestjs/common';

import { TransactionsModule } from '../transactions/transactions.module';

import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [TransactionsModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
