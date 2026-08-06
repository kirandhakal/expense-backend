import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import {
  Category,
  CategoryKind,
  KanbanColumn,
  PaymentMethod,
  Permission,
  Role,
  RolePermission,
  IncomeSource,
  User,
  Workspace,
  WorkspaceMember,
  WorkspaceType,
} from '../entities';
import {
  DEFAULT_KANBAN_COLUMNS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from './permissions.seed';
import {
  DEFAULT_DASHBOARD_WIDGETS,
  DEFAULT_INCOME_SOURCES,
  DEFAULT_PAYMENT_METHODS,
  HIERARCHICAL_EXPENSE_CATEGORIES,
} from './catalogs.seed';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Permission) private permissionRepo: Repository<Permission>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(RolePermission) private rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember) private memberRepo: Repository<WorkspaceMember>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(KanbanColumn) private kanbanColumnRepo: Repository<KanbanColumn>,
    @InjectRepository(PaymentMethod) private paymentMethodRepo: Repository<PaymentMethod>,
    @InjectRepository(IncomeSource) private incomeSourceRepo: Repository<IncomeSource>,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedPermissions();
    await this.seedSuperAdmin();
    await this.backfillWorkspaceCatalogs();
    this.logger.log('Database seed completed');
  }

  private async backfillWorkspaceCatalogs() {
    const workspaces = await this.workspaceRepo.find();
    for (const ws of workspaces) {
      await this.seedWorkspaceDefaults(ws.id);
      await this.createSystemRoles(ws.id);
    }

    await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set({ onboardingCompleted: true })
      .where('isSuperAdmin = :flag', { flag: true })
      .andWhere('onboardingCompleted = :done', { done: false })
      .execute();
  }

  private async seedPermissions() {
    for (const perm of PERMISSIONS) {
      const exists = await this.permissionRepo.findOne({ where: { name: perm.name } });
      if (!exists) {
        await this.permissionRepo.save(perm);
      }
    }
  }

  private async seedSuperAdmin() {
    const email = this.config.get('SUPER_ADMIN_EMAIL', 'admin@expensetracker.local');
    const password = this.config.get('SUPER_ADMIN_PASSWORD', 'Admin123!');

    let user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      user = await this.userRepo.save({
        email,
        passwordHash: await bcrypt.hash(password, 12),
        firstName: 'Super',
        lastName: 'Admin',
        isEmailVerified: true,
        isSuperAdmin: true,
        onboardingCompleted: true,
      });
      this.logger.log(`Super admin created: ${email}`);
    }

    const workspace = await this.workspaceRepo.findOne({
      where: { name: `${user.firstName}'s Workspace`, type: WorkspaceType.PERSONAL },
    });

    if (!workspace) {
      const ws = await this.workspaceRepo.save({
        name: `${user.firstName}'s Workspace`,
        type: WorkspaceType.PERSONAL,
        currency: 'USD',
        fiscalYearStart: '01-01',
        fiscalYearEnd: '12-31',
        settings: { dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS },
      });
      await this.seedWorkspaceDefaults(ws.id);
      const ownerRole = await this.createSystemRoles(ws.id);
      await this.memberRepo.save({
        userId: user.id,
        workspaceId: ws.id,
        roleId: ownerRole.id,
      });
    }
  }

  async seedWorkspaceDefaults(workspaceId: string) {
    await this.seedHierarchicalCategories(workspaceId);
    await this.seedPaymentMethods(workspaceId);
    await this.seedIncomeSources(workspaceId);

    for (const col of DEFAULT_KANBAN_COLUMNS) {
      const exists = await this.kanbanColumnRepo.findOne({
        where: { workspaceId, slug: col.slug },
      });
      if (!exists) {
        await this.kanbanColumnRepo.save({ ...col, workspaceId, isDefault: true });
      }
    }

    const ws = await this.workspaceRepo.findOne({ where: { id: workspaceId } });
    if (ws && !ws.settings?.dashboardWidgets) {
      await this.workspaceRepo.update(workspaceId, {
        settings: {
          ...(ws.settings || {}),
          dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS,
        },
      });
    }
  }

  private async seedHierarchicalCategories(workspaceId: string) {
    for (const group of HIERARCHICAL_EXPENSE_CATEGORIES) {
      let parent = await this.categoryRepo.findOne({
        where: { workspaceId, slug: group.slug },
      });
      if (!parent) {
        parent = await this.categoryRepo.save({
          name: group.name,
          slug: group.slug,
          color: group.color,
          icon: group.icon,
          workspaceId,
          isDefault: true,
          isActive: true,
          kind: CategoryKind.EXPENSE,
        });
      }

      for (const child of group.children || []) {
        const exists = await this.categoryRepo.findOne({
          where: { workspaceId, slug: child.slug },
        });
        if (!exists) {
          await this.categoryRepo.save({
            name: child.name,
            slug: child.slug,
            color: child.color,
            icon: child.icon,
            workspaceId,
            parentId: parent.id,
            isDefault: true,
            isActive: true,
            kind: CategoryKind.EXPENSE,
          });
        }
      }
    }
  }

  private async seedPaymentMethods(workspaceId: string) {
    for (const method of DEFAULT_PAYMENT_METHODS) {
      const exists = await this.paymentMethodRepo.findOne({
        where: { workspaceId, slug: method.slug },
      });
      if (!exists) {
        await this.paymentMethodRepo.save({
          ...method,
          workspaceId,
          isDefault: true,
          isActive: true,
        });
      }
    }
  }

  private async seedIncomeSources(workspaceId: string) {
    for (const source of DEFAULT_INCOME_SOURCES) {
      const exists = await this.incomeSourceRepo.findOne({
        where: { workspaceId, slug: source.slug },
      });
      if (!exists) {
        await this.incomeSourceRepo.save({
          ...source,
          workspaceId,
          isDefault: true,
          isActive: true,
        });
      }
    }
  }

  async createSystemRoles(workspaceId: string): Promise<Role> {
    const allPermissions = await this.permissionRepo.find();
    const permMap = new Map(allPermissions.map((p) => [p.name, p]));
    let ownerRole: Role | null = null;

    for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
      let role = await this.roleRepo.findOne({
        where: { workspaceId, name: roleName, isSystem: true },
      });

      if (!role) {
        role = await this.roleRepo.save({
          name: roleName,
          workspaceId,
          isSystem: true,
        });

        for (const permName of permNames) {
          const permission = permMap.get(permName);
          if (permission) {
            await this.rolePermissionRepo.save({ role, permission });
          }
        }
      }

      if (roleName === 'owner') ownerRole = role;
    }

    return ownerRole!;
  }
}
