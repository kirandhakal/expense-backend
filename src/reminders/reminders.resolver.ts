import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  CreateReminderSettingInput,
  RemindersService,
  UpdateReminderSettingInput,
} from './reminders.service';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ReminderSetting } from '../database/entities';

@Resolver(() => ReminderSetting)
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class RemindersResolver {
  constructor(private service: RemindersService) {}

  @Query(() => [ReminderSetting])
  reminderSettings(@WorkspaceId() workspaceId: string) {
    return this.service.findAll(workspaceId);
  }

  @RequirePermissions('reminder:manage')
  @Mutation(() => ReminderSetting)
  createReminderSetting(
    @WorkspaceId() workspaceId: string,
    @Args('input') input: CreateReminderSettingInput,
  ) {
    return this.service.create(workspaceId, input);
  }

  @RequirePermissions('reminder:manage')
  @Mutation(() => ReminderSetting)
  updateReminderSetting(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateReminderSettingInput,
  ) {
    return this.service.update(id, workspaceId, input);
  }

  @RequirePermissions('reminder:manage')
  @Mutation(() => Boolean)
  deleteReminderSetting(@WorkspaceId() workspaceId: string, @Args('id') id: string) {
    return this.service.delete(id, workspaceId);
  }
}
