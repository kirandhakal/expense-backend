import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertRule } from '../database/entities';
import { AlertsService } from './alerts.service';
import { AlertsResolver } from './alerts.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([AlertRule])],
  providers: [AlertsService, AlertsResolver],
  exports: [AlertsService],
})
export class AlertsModule {}
