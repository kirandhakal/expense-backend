import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../database/entities';
import { DashboardService } from './dashboard.service';
import { DashboardResolver } from './dashboard.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [DashboardService, DashboardResolver],
})
export class DashboardModule {}
