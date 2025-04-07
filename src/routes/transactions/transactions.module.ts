import { forwardRef, Module } from '@nestjs/common';

import { BankAccountsModule } from '../bank-accounts/bank-accounts.module';

import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
  imports: [forwardRef(() => BankAccountsModule)],
})
export class TransactionsModule {}
