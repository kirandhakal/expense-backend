import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from '../database/entities';
import { BudgetsService } from './budgets.service';
import { BudgetsResolver } from './budgets.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Budget])],
  providers: [BudgetsService, BudgetsResolver],
  exports: [BudgetsService],
})
export class BudgetsModule {}
