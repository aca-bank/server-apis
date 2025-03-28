import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from 'src/filters/http-exception';
import { PrismaClientExceptionFilter } from 'src/filters/prisma-exception';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { RbacGuard } from 'src/guards/rbac.guard';
import { SharedModule } from 'src/routes/_shared/shared.module';
import { AuthModule } from 'src/routes/auth/auth.module';
import { BankAccountsModule } from 'src/routes/bank-accounts/bank-accounts.module';
import { TransactionsModule } from 'src/routes/transactions/transactions.module';
import { UsersModule } from 'src/routes/users/users.module';

import appConfig from './app.config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    PrismaModule,
    SharedModule,
    AuthModule,
    UsersModule,
    BankAccountsModule,
    TransactionsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    { provide: APP_GUARD, useClass: RbacGuard },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
})
export class AppModule {}
