import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GoalsService, CreateGoalInput, UpdateGoalInput } from './goals.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { FinancialGoal } from '../database/entities';

@Resolver(() => FinancialGoal)
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class GoalsResolver {
  constructor(private goalsService: GoalsService) {}

  @RequirePermissions('goal:manage')
  @Query(() => [FinancialGoal])
  goals(@WorkspaceId() workspaceId: string) {
    return this.goalsService.findAll(workspaceId);
  }

  @RequirePermissions('goal:manage')
  @Mutation(() => FinancialGoal)
  createGoal(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreateGoalInput,
  ) {
    return this.goalsService.create(workspaceId, user.sub, input);
  }

  @RequirePermissions('goal:manage')
  @Mutation(() => FinancialGoal)
  updateGoal(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateGoalInput,
  ) {
    return this.goalsService.update(id, workspaceId, input);
  }

  @RequirePermissions('goal:manage')
  @Mutation(() => Boolean)
  deleteGoal(@WorkspaceId() workspaceId: string, @Args('id') id: string) {
    return this.goalsService.delete(id, workspaceId);
  }
}
