import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AlertType,
  BudgetStrategy,
  BudgetType,
  Category,
  CategoryKind,
  GoalPriority,
  PaymentMethod,
  ReminderAssignee,
  ReminderChannel,
  ReminderTarget,
  ReminderTiming,
  User,
  Workspace,
  WorkspaceMember,
  WorkspaceType,
} from '../database/entities';
import {
  DASHBOARD_WIDGETS,
  DEFAULT_DASHBOARD_WIDGETS,
  FISCAL_YEAR_PRESETS,
  GOAL_TEMPLATES,
  INCOME_FREQUENCIES,
  RECURRING_TEMPLATES,
  RELATIONSHIP_TYPES,
} from '../database/seed/catalogs.seed';
import { HouseholdMembersService } from '../household-members/household-members.service';
import { IncomeStreamsService } from '../income-streams/income-streams.service';
import { BudgetsService } from '../budgets/budgets.service';
import { RecurringTransactionsService } from '../recurring/recurring.service';
import { AlertsService } from '../alerts/alerts.service';
import { RemindersService } from '../reminders/reminders.service';
import { GoalsService } from '../goals/goals.service';
import { OnboardingState, SaveOnboardingStepInput } from './dto/onboarding.dto';

const TOTAL_STEPS = 13;

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private memberRepo: Repository<WorkspaceMember>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepo: Repository<PaymentMethod>,
    private householdMembersService: HouseholdMembersService,
    private incomeStreamsService: IncomeStreamsService,
    private budgetsService: BudgetsService,
    private recurringService: RecurringTransactionsService,
    private alertsService: AlertsService,
    private remindersService: RemindersService,
    private goalsService: GoalsService,
  ) {}

  async getState(
    userId: string,
    workspaceId?: string,
  ): Promise<OnboardingState> {
    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    const workspace = await this.resolveWorkspace(userId, workspaceId);

    return {
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep ?? 1,
      user,
      workspace: workspace || undefined,
      catalogs: {
        relationshipTypes: [...RELATIONSHIP_TYPES],
        incomeFrequencies: [...INCOME_FREQUENCIES],
        goalTemplates: GOAL_TEMPLATES,
        recurringTemplates: RECURRING_TEMPLATES,
        dashboardWidgets: [...DASHBOARD_WIDGETS],
        fiscalYearPresets: FISCAL_YEAR_PRESETS,
      },
      draft: workspace ? await this.buildDraft(user, workspace) : undefined,
    };
  }

  async saveStep(
    userId: string,
    workspaceId: string | undefined,
    input: SaveOnboardingStepInput,
  ): Promise<OnboardingState> {
    const workspace = await this.resolveWorkspace(userId, workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');

    const step = input.step;

    if (input.personal) {
      const { currency, ...profile } = input.personal;
      await this.userRepo.update(userId, {
        ...Object.fromEntries(
          Object.entries(profile).filter(([, v]) => v !== undefined),
        ),
      });
      if (currency) {
        await this.workspaceRepo.update(workspace.id, { currency });
      }
    }

    if (input.fiscalYear) {
      let start = input.fiscalYear.fiscalYearStart;
      let end = input.fiscalYear.fiscalYearEnd;
      if (
        input.fiscalYear.preset &&
        FISCAL_YEAR_PRESETS[
          input.fiscalYear.preset as keyof typeof FISCAL_YEAR_PRESETS
        ]
      ) {
        const preset =
          FISCAL_YEAR_PRESETS[
            input.fiscalYear.preset as keyof typeof FISCAL_YEAR_PRESETS
          ];
        start = preset.start;
        end = preset.end;
      }
      await this.workspaceRepo.update(workspace.id, {
        fiscalYearStart: start,
        fiscalYearEnd: end,
      });
    }

    if (input.household) {
      const updates: Record<string, unknown> = {};
      if (input.household.type) updates.type = input.household.type;
      if (input.household.name) updates.name = input.household.name;
      if (Object.keys(updates).length) {
        await this.workspaceRepo.update(workspace.id, updates);
      }
      if (input.household.members) {
        await this.householdMembersService.replaceAll(
          workspace.id,
          input.household.members,
        );
      }
    }

    if (input.income?.streams) {
      await this.incomeStreamsService.replaceAll(
        workspace.id,
        input.income.streams,
      );
    }

    if (input.expensePlan) {
      const current = await this.workspaceRepo.findOneOrFail({
        where: { id: workspace.id },
      });
      await this.workspaceRepo.update(workspace.id, {
        settings: {
          ...(current.settings || {}),
          expectedMonthlyExpense: input.expensePlan.expectedMonthlyExpense,
          categorySplits: input.expensePlan.categorySplits,
        },
      });
    }

    if (input.categories) {
      await this.categoryRepo.update(
        { workspaceId: workspace.id },
        { isActive: true },
      );
      if (input.categories.disabledCategoryIds?.length) {
        for (const id of input.categories.disabledCategoryIds) {
          await this.categoryRepo.update(
            { id, workspaceId: workspace.id },
            { isActive: false },
          );
        }
      }
      if (input.categories.customCategoryNames?.length) {
        for (const name of input.categories.customCategoryNames) {
          const slug = name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
          const exists = await this.categoryRepo.findOne({
            where: { workspaceId: workspace.id, slug },
          });
          if (!exists) {
            await this.categoryRepo.save({
              name,
              slug,
              workspaceId: workspace.id,
              isDefault: false,
              isActive: true,
              kind: CategoryKind.EXPENSE,
              color: '#6b7280',
            });
          }
        }
      }
    }

    if (input.paymentMethods) {
      await this.paymentMethodRepo.update(
        { workspaceId: workspace.id },
        { isActive: true },
      );
      if (input.paymentMethods.disabledPaymentMethodIds?.length) {
        for (const id of input.paymentMethods.disabledPaymentMethodIds) {
          await this.paymentMethodRepo.update(
            { id, workspaceId: workspace.id },
            { isActive: false },
          );
        }
      }
    }

    if (input.budget) {
      if (input.budget.amount != null) {
        await this.budgetsService.replaceAll(workspace.id, [
          {
            type: input.budget.type || BudgetType.MONTHLY,
            strategy: input.budget.strategy || BudgetStrategy.FIXED,
            amount: input.budget.amount,
          },
        ]);
      } else {
        await this.budgetsService.replaceAll(workspace.id, []);
      }
    }

    if (input.recurring?.items) {
      await this.recurringService.replaceAll(
        workspace.id,
        input.recurring.items,
      );
    }

    if (input.alerts?.rules) {
      await this.alertsService.replaceAll(workspace.id, input.alerts.rules);
    }

    if (input.reminders?.settings) {
      await this.remindersService.replaceAll(
        workspace.id,
        input.reminders.settings,
      );
    }

    if (input.goals?.goals) {
      const existing = await this.goalsService.findAll(workspace.id);
      for (const g of existing) {
        await this.goalsService.delete(g.id, workspace.id);
      }
      for (const goal of input.goals.goals) {
        await this.goalsService.create(workspace.id, userId, {
          title: goal.title,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: goal.deadline,
          category: goal.category,
          priority: goal.priority || GoalPriority.MEDIUM,
        });
      }
    }

    if (input.dashboard?.widgets) {
      const current = await this.workspaceRepo.findOneOrFail({
        where: { id: workspace.id },
      });
      await this.workspaceRepo.update(workspace.id, {
        settings: {
          ...(current.settings || {}),
          dashboardWidgets: input.dashboard.widgets,
        },
      });
    }

    const currentUser = await this.userRepo.findOneOrFail({
      where: { id: userId },
    });
    await this.userRepo.update(userId, {
      onboardingStep: Math.min(
        Math.max(currentUser.onboardingStep ?? 1, step + 1),
        TOTAL_STEPS,
      ),
    });

    return this.getState(userId, workspace.id);
  }

  async complete(
    userId: string,
    workspaceId?: string,
  ): Promise<OnboardingState> {
    const workspace = await this.resolveWorkspace(userId, workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');

    // Apply smart defaults if user skipped optional steps
    const alerts = await this.alertsService.findAll(workspace.id);
    if (!alerts.length) {
      await this.alertsService.replaceAll(workspace.id, [
        { type: AlertType.EXPENSE_WARNING, threshold: 80, enabled: true },
        { type: AlertType.EXPENSE_WARNING, threshold: 100, enabled: true },
        { type: AlertType.BUDGET_EXCEEDED, enabled: true },
        { type: AlertType.RECURRING_BILL, enabled: true },
        { type: AlertType.LARGE_TRANSACTION, threshold: 10000, enabled: true },
      ]);
    }

    const reminders = await this.remindersService.findAll(workspace.id);
    if (!reminders.length) {
      await this.remindersService.replaceAll(workspace.id, [
        {
          channels: [ReminderChannel.EMAIL, ReminderChannel.PUSH],
          target: ReminderTarget.BILLS,
          timing: ReminderTiming.ONE_DAY_BEFORE,
          assignTo: ReminderAssignee.SELF,
        },
        {
          channels: [ReminderChannel.EMAIL],
          target: ReminderTarget.RENT,
          timing: ReminderTiming.THREE_DAYS_BEFORE,
          assignTo: ReminderAssignee.SELF,
        },
      ]);
    }

    const current = await this.workspaceRepo.findOneOrFail({
      where: { id: workspace.id },
    });
    if (!current.settings?.dashboardWidgets) {
      await this.workspaceRepo.update(workspace.id, {
        settings: {
          ...(current.settings || {}),
          dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS,
        },
      });
    }

    if (!current.fiscalYearStart) {
      await this.workspaceRepo.update(workspace.id, {
        fiscalYearStart: FISCAL_YEAR_PRESETS.nepal.start,
        fiscalYearEnd: FISCAL_YEAR_PRESETS.nepal.end,
      });
    }

    // Ensure type is set
    if (!current.type) {
      await this.workspaceRepo.update(workspace.id, {
        type: WorkspaceType.PERSONAL,
      });
    }

    await this.userRepo.update(userId, {
      onboardingCompleted: true,
      onboardingStep: TOTAL_STEPS,
    });

    return this.getState(userId, workspace.id);
  }

  private async resolveWorkspace(userId: string, workspaceId?: string) {
    if (workspaceId) {
      const membership = await this.memberRepo.findOne({
        where: { userId, workspaceId, isActive: true },
      });
      if (!membership) {
        const workspace = await this.workspaceRepo.findOne({
          where: { id: workspaceId },
        });
        if (workspace) {
          throw new ForbiddenException(
            'You do not have access to this workspace',
          );
        }
        return null;
      }
      return this.workspaceRepo.findOne({ where: { id: workspaceId } });
    }
    const membership = await this.memberRepo.findOne({
      where: { userId, isActive: true },
      order: { createdAt: 'ASC' },
    });
    if (!membership) return null;
    return this.workspaceRepo.findOne({
      where: { id: membership.workspaceId },
    });
  }

  private async buildDraft(user: User, workspace: Workspace) {
    const [
      members,
      incomeStreams,
      budgets,
      recurring,
      alerts,
      reminders,
      goals,
    ] = await Promise.all([
      this.householdMembersService.findAll(workspace.id),
      this.incomeStreamsService.findAll(workspace.id),
      this.budgetsService.findAll(workspace.id),
      this.recurringService.findAll(workspace.id),
      this.alertsService.findAll(workspace.id),
      this.remindersService.findAll(workspace.id),
      this.goalsService.findAll(workspace.id),
    ]);
    const [categories, paymentMethods] = await Promise.all([
      this.categoryRepo.find({ where: { workspaceId: workspace.id } }),
      this.paymentMethodRepo.find({ where: { workspaceId: workspace.id } }),
    ]);

    const settings = workspace.settings || {};
    const storedWidgets = settings.dashboardWidgets;
    const dashboardWidgets = Array.isArray(storedWidgets)
      ? storedWidgets.filter(
          (widget): widget is string => typeof widget === 'string',
        )
      : [...DEFAULT_DASHBOARD_WIDGETS];
    const expectedMonthlyExpense = this.numberOrUndefined(
      settings.expectedMonthlyExpense,
    );
    const primaryBudget = budgets[0];

    return {
      personal: {
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        currency: workspace.currency,
        timezone: user.timezone,
        language: user.language,
      },
      fiscalYear: {
        preset: this.detectFiscalPreset(
          workspace.fiscalYearStart,
          workspace.fiscalYearEnd,
        ),
        fiscalYearStart: workspace.fiscalYearStart,
        fiscalYearEnd: workspace.fiscalYearEnd,
      },
      household: {
        type: workspace.type,
        name: workspace.name,
        members: members.map((member) => ({
          name: member.name,
          relationship: member.relationship,
          email: member.email,
          phone: member.phone,
          roleKey: member.roleKey,
        })),
      },
      income: {
        streams: incomeStreams.map((stream) => ({
          incomeSourceId: stream.incomeSourceId,
          expectedAmount: Number(stream.expectedAmount),
          frequency: stream.frequency,
          startDate: stream.startDate,
          autoRecord: stream.autoRecord,
        })),
      },
      expensePlan: {
        expectedMonthlyExpense,
        categorySplits: settings.categorySplits,
      },
      categories: {
        disabledCategoryIds: categories
          .filter((category) => !category.isActive)
          .map((category) => category.id),
        customCategoryNames: categories
          .filter((category) => !category.isDefault)
          .map((category) => category.name),
      },
      paymentMethods: {
        disabledPaymentMethodIds: paymentMethods
          .filter((method) => !method.isActive)
          .map((method) => method.id),
      },
      budget: primaryBudget
        ? {
            type: primaryBudget.type,
            strategy: primaryBudget.strategy,
            amount: Number(primaryBudget.amount),
          }
        : undefined,
      recurring: {
        items: recurring.map((item) => ({
          name: item.name,
          amount: Number(item.amount),
          frequency: item.frequency,
          startDate: item.startDate,
          direction: item.direction,
          reminderBeforeDays: item.reminderBeforeDays,
          autoCreate: item.autoCreate,
          categoryId: item.categoryId,
        })),
      },
      alerts: {
        rules: alerts.map((rule) => ({
          type: rule.type,
          threshold: this.numberOrUndefined(rule.threshold),
          enabled: rule.enabled,
        })),
      },
      reminders: {
        settings: reminders.map((setting) => ({
          channels: setting.channels,
          target: setting.target,
          timing: setting.timing,
          assignTo: setting.assignTo,
          enabled: setting.enabled,
        })),
      },
      goals: {
        goals: goals.map((goal) => ({
          title: goal.title,
          targetAmount: Number(goal.targetAmount),
          currentAmount: Number(goal.currentAmount),
          deadline: goal.deadline,
          category: goal.category,
          priority: goal.priority,
        })),
      },
      dashboard: {
        widgets: dashboardWidgets,
      },
    };
  }

  private detectFiscalPreset(start?: string | null, end?: string | null) {
    if (!start || !end) return 'nepal';
    for (const [key, preset] of Object.entries(FISCAL_YEAR_PRESETS)) {
      if (preset.start === start && preset.end === end) return key;
    }
    return 'custom';
  }

  private numberOrUndefined(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
