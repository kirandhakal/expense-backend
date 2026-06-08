import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { GqlThrottlerGuard } from './common/guards/gql-throttler.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import type { Request, Response } from 'express';
import GraphQLJSON from 'graphql-type-json';
import { DatabaseModule } from './database/database.module';
import { SeedModule } from './database/seed/seed.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { MembersModule } from './members/members.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GoalsModule } from './goals/goals.module';
import { KanbanModule } from './kanban/kanban.module';
import { StickyNotesModule } from './sticky-notes/sticky-notes.module';
import { CategoriesModule } from './categories/categories.module';
import { RolesModule } from './roles/roles.module';
import { MemberGroupsModule } from './member-groups/member-groups.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { AuditModule } from './audit/audit.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { SanitizePipe } from './common/pipes/sanitize.pipe';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
      resolvers: { JSON: GraphQLJSON },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60000),
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST', 'localhost'),
          port: config.get<number>('MAIL_PORT', 1025),
          secure: false,
          auth: config.get('MAIL_USER')
            ? {
                user: config.get('MAIL_USER'),
                pass: config.get('MAIL_PASSWORD'),
              }
            : undefined,
        },
        defaults: {
          from: config.get('MAIL_FROM', 'noreply@expensetracker.local'),
        },
      }),
    }),
    DatabaseModule,
    SeedModule,
    CommonModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    MembersModule,
    TransactionsModule,
    DashboardModule,
    GoalsModule,
    KanbanModule,
    StickyNotesModule,
    CategoriesModule,
    RolesModule,
    MemberGroupsModule,
    NotificationsModule,
    SearchModule,
    AuditModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    { provide: APP_PIPE, useClass: SanitizePipe },
  ],
})
export class AppModule {}
