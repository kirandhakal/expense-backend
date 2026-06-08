import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialGoal } from '../database/entities';
import { GoalsService } from './goals.service';
import { GoalsResolver } from './goals.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialGoal])],
  providers: [GoalsService, GoalsResolver],
})
export class GoalsModule {}
