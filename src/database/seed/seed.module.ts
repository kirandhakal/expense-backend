import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Category,
  IncomeSource,
  KanbanColumn,
  PaymentMethod,
  Permission,
  Role,
  RolePermission,
  User,
  Workspace,
  WorkspaceMember,
} from '../entities';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      Role,
      RolePermission,
      User,
      Workspace,
      WorkspaceMember,
      Category,
      KanbanColumn,
      PaymentMethod,
      IncomeSource,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
