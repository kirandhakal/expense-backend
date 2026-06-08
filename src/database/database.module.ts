import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  AuditLog,
  Category,
  EmailVerificationToken,
  FinancialGoal,
  Invitation,
  KanbanColumn,
  KanbanTask,
  MemberGroup,
  MfaSecret,
  Notification,
  PasswordResetToken,
  Permission,
  RefreshToken,
  Role,
  RolePermission,
  StickyNote,
  Transaction,
  User,
  Workspace,
  WorkspaceMember,
} from './entities';

const entities = [
  User,
  RefreshToken,
  MfaSecret,
  Workspace,
  Permission,
  Role,
  RolePermission,
  WorkspaceMember,
  Category,
  Transaction,
  FinancialGoal,
  KanbanColumn,
  KanbanTask,
  StickyNote,
  MemberGroup,
  Invitation,
  Notification,
  AuditLog,
  EmailVerificationToken,
  PasswordResetToken,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'dev'),
        password: config.get<string>('DATABASE_PASSWORD', 'dev'),
        database: config.get<string>('DATABASE_NAME', 'expense_tracker'),
        entities,
        synchronize: config.get<string>('DATABASE_SYNC', 'true') === 'true',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
