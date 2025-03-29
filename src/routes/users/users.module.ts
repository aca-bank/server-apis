import { Module } from '@nestjs/common';

import { AccountsModule } from '../accounts/accounts.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [AccountsModule],
})
export class UsersModule {}
