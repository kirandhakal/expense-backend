import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  MemberGroupsService,
  CreateMemberGroupInput,
  UpdateMemberGroupInput,
} from './member-groups.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { MemberGroup } from '../database/entities';

@Resolver(() => MemberGroup)
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class MemberGroupsResolver {
  constructor(private memberGroupsService: MemberGroupsService) {}

  @RequirePermissions('group:manage')
  @Query(() => [MemberGroup])
  memberGroups(@WorkspaceId() workspaceId: string) {
    return this.memberGroupsService.findAll(workspaceId);
  }

  @RequirePermissions('group:manage')
  @Mutation(() => MemberGroup)
  createMemberGroup(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreateMemberGroupInput,
  ) {
    return this.memberGroupsService.create(workspaceId, user.sub, input);
  }

  @RequirePermissions('group:manage')
  @Mutation(() => MemberGroup)
  updateMemberGroup(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateMemberGroupInput,
  ) {
    return this.memberGroupsService.update(id, workspaceId, input);
  }

  @RequirePermissions('group:manage')
  @Mutation(() => Boolean)
  deleteMemberGroup(@WorkspaceId() workspaceId: string, @Args('id') id: string) {
    return this.memberGroupsService.delete(id, workspaceId);
  }
}
