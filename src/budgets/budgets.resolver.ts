import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BudgetsService, CreateBudgetInput, UpdateBudgetInput } from './budgets.service';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Budget } from '../database/entities';

@Resolver(() => Budget)
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class BudgetsResolver {
  constructor(private service: BudgetsService) {}

  @Query(() => [Budget])
  budgets(@WorkspaceId() workspaceId: string) {
    return this.service.findAll(workspaceId);
  }

  @RequirePermissions('budget:manage')
  @Mutation(() => Budget)
  createBudget(@WorkspaceId() workspaceId: string, @Args('input') input: CreateBudgetInput) {
    return this.service.create(workspaceId, input);
  }

  @RequirePermissions('budget:manage')
  @Mutation(() => Budget)
  updateBudget(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateBudgetInput,
  ) {
    return this.service.update(id, workspaceId, input);
  }

  @RequirePermissions('budget:manage')
  @Mutation(() => Boolean)
  deleteBudget(@WorkspaceId() workspaceId: string, @Args('id') id: string) {
    return this.service.delete(id, workspaceId);
  }
}
