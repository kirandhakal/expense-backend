import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeSource, IncomeStream } from '../database/entities';
import { IncomeStreamsService } from './income-streams.service';
import { IncomeStreamsResolver } from './income-streams.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeStream, IncomeSource])],
  providers: [IncomeStreamsService, IncomeStreamsResolver],
  exports: [IncomeStreamsService],
})
export class IncomeStreamsModule {}
