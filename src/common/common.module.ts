import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog, WorkspaceMember } from '../database/entities';
import { AuditService } from './services/audit.service';
import { WorkspaceGuard } from './guards/workspace.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, WorkspaceMember])],
  providers: [AuditService, WorkspaceGuard, RolesGuard, PermissionsGuard],
  exports: [TypeOrmModule, AuditService, WorkspaceGuard, RolesGuard, PermissionsGuard],
})
export class CommonModule {}
