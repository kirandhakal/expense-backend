import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Category,
  PaymentMethod,
  User,
  Workspace,
  WorkspaceMember,
} from '../database/entities';
import { OnboardingService } from './onboarding.service';
import { OnboardingResolver } from './onboarding.resolver';
import { HouseholdMembersModule } from '../household-members/household-members.module';
import { IncomeStreamsModule } from '../income-streams/income-streams.module';
import { BudgetsModule } from '../budgets/budgets.module';
import { RecurringModule } from '../recurring/recurring.module';
import { AlertsModule } from '../alerts/alerts.module';
import { RemindersModule } from '../reminders/reminders.module';
import { GoalsModule } from '../goals/goals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Workspace,
      WorkspaceMember,
      Category,
      PaymentMethod,
    ]),
    HouseholdMembersModule,
    IncomeStreamsModule,
    BudgetsModule,
    RecurringModule,
    AlertsModule,
    RemindersModule,
    GoalsModule,
  ],
  providers: [OnboardingService, OnboardingResolver],
})
export class OnboardingModule {}
