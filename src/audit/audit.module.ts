import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../database/entities';
import { AuditResolver } from './audit.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditResolver],
})
export class AuditModule {}
