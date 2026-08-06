import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  CreateHouseholdMemberInput,
  HouseholdMembersService,
  UpdateHouseholdMemberInput,
} from './household-members.service';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { HouseholdMember } from '../database/entities';

@Resolver(() => HouseholdMember)
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class HouseholdMembersResolver {
  constructor(private service: HouseholdMembersService) {}

  @Query(() => [HouseholdMember])
  householdMembers(@WorkspaceId() workspaceId: string) {
    return this.service.findAll(workspaceId);
  }

  @RequirePermissions('member:update')
  @Mutation(() => HouseholdMember)
  createHouseholdMember(
    @WorkspaceId() workspaceId: string,
    @Args('input') input: CreateHouseholdMemberInput,
  ) {
    return this.service.create(workspaceId, input);
  }

  @RequirePermissions('member:update')
  @Mutation(() => HouseholdMember)
  updateHouseholdMember(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateHouseholdMemberInput,
  ) {
    return this.service.update(id, workspaceId, input);
  }

  @RequirePermissions('member:remove')
  @Mutation(() => Boolean)
  deleteHouseholdMember(@WorkspaceId() workspaceId: string, @Args('id') id: string) {
    return this.service.delete(id, workspaceId);
  }
}
