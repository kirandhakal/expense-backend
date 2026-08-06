import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringTransaction } from '../database/entities';
import { RecurringTransactionsService } from './recurring.service';
import { RecurringTransactionsResolver } from './recurring.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([RecurringTransaction])],
  providers: [RecurringTransactionsService, RecurringTransactionsResolver],
  exports: [RecurringTransactionsService],
})
export class RecurringModule {}
