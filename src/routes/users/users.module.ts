import { Module } from '@nestjs/common';

import { BankAccountsModule } from '../bank-accounts/bank-accounts.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [BankAccountsModule],
})
export class UsersModule {}
