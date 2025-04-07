import { forwardRef, Module } from '@nestjs/common';

import { TransactionsModule } from '../transactions/transactions.module';

import { BankAccountsController } from './bank-accounts.controller';
import { BankAccountsService } from './bank-accounts.service';

@Module({
  controllers: [BankAccountsController],
  providers: [BankAccountsService],
  exports: [BankAccountsService],
  imports: [forwardRef(() => TransactionsModule)],
})
export class BankAccountsModule {}
