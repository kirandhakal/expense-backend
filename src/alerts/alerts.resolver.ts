import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AlertsService, CreateAlertRuleInput, UpdateAlertRuleInput } from './alerts.service';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { AlertRule } from '../database/entities';

@Resolver(() => AlertRule)
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class AlertsResolver {
  constructor(private service: AlertsService) {}

  @Query(() => [AlertRule])
  alertRules(@WorkspaceId() workspaceId: string) {
    return this.service.findAll(workspaceId);
  }

  @RequirePermissions('alert:manage')
  @Mutation(() => AlertRule)
  createAlertRule(
    @WorkspaceId() workspaceId: string,
    @Args('input') input: CreateAlertRuleInput,
  ) {
    return this.service.create(workspaceId, input);
  }

  @RequirePermissions('alert:manage')
  @Mutation(() => AlertRule)
  updateAlertRule(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateAlertRuleInput,
  ) {
    return this.service.update(id, workspaceId, input);
  }

  @RequirePermissions('alert:manage')
  @Mutation(() => Boolean)
  deleteAlertRule(@WorkspaceId() workspaceId: string, @Args('id') id: string) {
    return this.service.delete(id, workspaceId);
  }
}
