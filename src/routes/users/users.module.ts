import { Module } from '@nestjs/common';

import { TransactionsModule } from '../transactions/transactions.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TransactionsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
