import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialGoal, KanbanTask, Transaction } from '../database/entities';
import { SearchService } from './search.service';
import { SearchResolver } from './search.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, FinancialGoal, KanbanTask])],
  providers: [SearchService, SearchResolver],
})
export class SearchModule {}
