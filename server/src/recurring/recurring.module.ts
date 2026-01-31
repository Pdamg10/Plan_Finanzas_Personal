import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringService } from './recurring.service';
import { RecurringController } from './recurring.controller';
import { RecurringTransaction } from './recurring.entity';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TypeOrmModule.forFeature([RecurringTransaction]), TransactionsModule],
  providers: [RecurringService],
  controllers: [RecurringController],
})
export class RecurringModule {}
