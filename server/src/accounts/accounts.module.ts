import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { Account } from './account.entity';

import { BalanceHistory } from './balance-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, BalanceHistory])],
  providers: [AccountsService],
  controllers: [AccountsController],
  exports: [AccountsService],
})
export class AccountsModule {}
