import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import {
  AlertType,
  BudgetStrategy,
  BudgetType,
  GoalPriority,
  HouseholdMemberRole,
  IncomeFrequency,
  RecurringDirection,
  ReminderAssignee,
  ReminderChannel,
  ReminderTarget,
  ReminderTiming,
  User,
  Workspace,
  WorkspaceType,
} from '../../database/entities';

@ObjectType()
export class OnboardingCatalogs {
  @Field(() => GraphQLJSON)
  relationshipTypes: string[];

  @Field(() => GraphQLJSON)
  incomeFrequencies: string[];

  @Field(() => GraphQLJSON)
  goalTemplates: Array<Record<string, string>>;

  @Field(() => GraphQLJSON)
  recurringTemplates: Array<Record<string, string>>;

  @Field(() => GraphQLJSON)
  dashboardWidgets: string[];

  @Field(() => GraphQLJSON)
  fiscalYearPresets: Record<string, { start: string; end: string; label: string }>;
}

@ObjectType()
export class OnboardingState {
  @Field()
  onboardingCompleted: boolean;

  @Field(() => Int, { nullable: true })
  onboardingStep?: number;

  @Field(() => User)
  user: User;

  @Field(() => Workspace, { nullable: true })
  workspace?: Workspace;

  @Field(() => OnboardingCatalogs)
  catalogs: OnboardingCatalogs;

  @Field(() => GraphQLJSON, { nullable: true })
  draft?: Record<string, unknown>;
}

@InputType()
export class OnboardingPersonalInput {
  @Field({ nullable: true }) @IsOptional() @IsString() firstName?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() lastName?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() country?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() currency?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() timezone?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() language?: string;
}

@InputType()
export class OnboardingFiscalYearInput {
  @Field({ nullable: true }) @IsOptional() @IsString() preset?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() fiscalYearStart?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() fiscalYearEnd?: string;
}

@InputType()
export class OnboardingMemberInput {
  @Field() @IsString() name: string;
  @Field() @IsString() relationship: string;
  @Field({ nullable: true }) @IsOptional() @IsString() email?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() phone?: string;
  @Field(() => HouseholdMemberRole, { nullable: true })
  @IsOptional()
  @IsEnum(HouseholdMemberRole)
  roleKey?: HouseholdMemberRole;
}

@InputType()
export class OnboardingHouseholdInput {
  @Field(() => WorkspaceType, { nullable: true })
  @IsOptional()
  @IsEnum(WorkspaceType)
  type?: WorkspaceType;

  @Field({ nullable: true }) @IsOptional() @IsString() name?: string;

  @Field(() => [OnboardingMemberInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OnboardingMemberInput)
  members?: OnboardingMemberInput[];
}

@InputType()
export class OnboardingIncomeStreamInput {
  @Field() @IsString() incomeSourceId: string;
  @Field(() => Float) @IsNumber() expectedAmount: number;
  @Field(() => IncomeFrequency) @IsEnum(IncomeFrequency) frequency: IncomeFrequency;
  @Field() @IsDateString() startDate: string;
  @Field({ nullable: true }) @IsOptional() @IsBoolean() autoRecord?: boolean;
}

@InputType()
export class OnboardingIncomeInput {
  @Field(() => [OnboardingIncomeStreamInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OnboardingIncomeStreamInput)
  streams?: OnboardingIncomeStreamInput[];
}

@InputType()
export class OnboardingExpensePlanInput {
  @Field(() => Float, { nullable: true }) @IsOptional() @IsNumber() expectedMonthlyExpense?: number;
  @Field(() => GraphQLJSON, { nullable: true }) @IsOptional() categorySplits?: Record<string, number>;
}

@InputType()
export class OnboardingCategoriesInput {
  @Field(() => [String], { nullable: true }) @IsOptional() disabledCategoryIds?: string[];
  @Field(() => [String], { nullable: true }) @IsOptional() customCategoryNames?: string[];
}

@InputType()
export class OnboardingPaymentMethodsInput {
  @Field(() => [String], { nullable: true }) @IsOptional() disabledPaymentMethodIds?: string[];
}

@InputType()
export class OnboardingBudgetInput {
  @Field(() => BudgetType, { nullable: true }) @IsOptional() @IsEnum(BudgetType) type?: BudgetType;
  @Field(() => BudgetStrategy, { nullable: true }) @IsOptional() @IsEnum(BudgetStrategy) strategy?: BudgetStrategy;
  @Field(() => Float, { nullable: true }) @IsOptional() @IsNumber() amount?: number;
}

@InputType()
export class OnboardingRecurringItemInput {
  @Field() @IsString() name: string;
  @Field(() => Float) @IsNumber() amount: number;
  @Field(() => IncomeFrequency) @IsEnum(IncomeFrequency) frequency: IncomeFrequency;
  @Field() @IsDateString() startDate: string;
  @Field(() => RecurringDirection) @IsEnum(RecurringDirection) direction: RecurringDirection;
  @Field(() => Int, { nullable: true }) @IsOptional() reminderBeforeDays?: number;
  @Field({ nullable: true }) @IsOptional() @IsBoolean() autoCreate?: boolean;
  @Field({ nullable: true }) @IsOptional() @IsString() categoryId?: string;
}

@InputType()
export class OnboardingRecurringInput {
  @Field(() => [OnboardingRecurringItemInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OnboardingRecurringItemInput)
  items?: OnboardingRecurringItemInput[];
}

@InputType()
export class OnboardingAlertInput {
  @Field(() => AlertType) @IsEnum(AlertType) type: AlertType;
  @Field(() => Float, { nullable: true }) @IsOptional() @IsNumber() threshold?: number;
  @Field({ nullable: true }) @IsOptional() @IsBoolean() enabled?: boolean;
}

@InputType()
export class OnboardingAlertsInput {
  @Field(() => [OnboardingAlertInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OnboardingAlertInput)
  rules?: OnboardingAlertInput[];
}

@InputType()
export class OnboardingReminderInput {
  @Field(() => [ReminderChannel])
  @IsArray()
  @IsEnum(ReminderChannel, { each: true })
  channels: ReminderChannel[];
  @Field(() => ReminderTarget) @IsEnum(ReminderTarget) target: ReminderTarget;
  @Field(() => ReminderTiming, { nullable: true }) @IsOptional() @IsEnum(ReminderTiming) timing?: ReminderTiming;
  @Field(() => ReminderAssignee, { nullable: true }) @IsOptional() @IsEnum(ReminderAssignee) assignTo?: ReminderAssignee;
}

@InputType()
export class OnboardingRemindersInput {
  @Field(() => [OnboardingReminderInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OnboardingReminderInput)
  settings?: OnboardingReminderInput[];
}

@InputType()
export class OnboardingGoalInput {
  @Field() @IsString() title: string;
  @Field(() => Float) @IsNumber() targetAmount: number;
  @Field(() => Float, { nullable: true }) @IsOptional() @IsNumber() currentAmount?: number;
  @Field() @IsDateString() deadline: string;
  @Field() @IsString() category: string;
  @Field(() => GoalPriority, { nullable: true }) @IsOptional() @IsEnum(GoalPriority) priority?: GoalPriority;
}

@InputType()
export class OnboardingGoalsInput {
  @Field(() => [OnboardingGoalInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OnboardingGoalInput)
  goals?: OnboardingGoalInput[];
}

@InputType()
export class OnboardingDashboardInput {
  @Field(() => [String], { nullable: true }) @IsOptional() widgets?: string[];
}

@InputType()
export class SaveOnboardingStepInput {
  @Field(() => Int) @IsInt() step: number;

  @Field(() => OnboardingPersonalInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingPersonalInput)
  personal?: OnboardingPersonalInput;

  @Field(() => OnboardingFiscalYearInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingFiscalYearInput)
  fiscalYear?: OnboardingFiscalYearInput;

  @Field(() => OnboardingHouseholdInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingHouseholdInput)
  household?: OnboardingHouseholdInput;

  @Field(() => OnboardingIncomeInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingIncomeInput)
  income?: OnboardingIncomeInput;

  @Field(() => OnboardingExpensePlanInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingExpensePlanInput)
  expensePlan?: OnboardingExpensePlanInput;

  @Field(() => OnboardingCategoriesInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingCategoriesInput)
  categories?: OnboardingCategoriesInput;

  @Field(() => OnboardingPaymentMethodsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingPaymentMethodsInput)
  paymentMethods?: OnboardingPaymentMethodsInput;

  @Field(() => OnboardingBudgetInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingBudgetInput)
  budget?: OnboardingBudgetInput;

  @Field(() => OnboardingRecurringInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingRecurringInput)
  recurring?: OnboardingRecurringInput;

  @Field(() => OnboardingAlertsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingAlertsInput)
  alerts?: OnboardingAlertsInput;

  @Field(() => OnboardingRemindersInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingRemindersInput)
  reminders?: OnboardingRemindersInput;

  @Field(() => OnboardingGoalsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingGoalsInput)
  goals?: OnboardingGoalsInput;

  @Field(() => OnboardingDashboardInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingDashboardInput)
  dashboard?: OnboardingDashboardInput;
}
