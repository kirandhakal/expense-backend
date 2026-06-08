import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import {
  AcceptInvitationInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
} from './dto/members.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Invitation, Workspace } from '../database/entities';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class MemberView {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  role: string;

  @Field()
  roleId: string;

  @Field()
  avatar: string;

  @Field()
  joinedDate: string;

  @Field()
  accountType: string;
}

@Resolver()
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class MembersResolver {
  constructor(private membersService: MembersService) {}

  @RequirePermissions('member:read')
  @Query(() => [MemberView])
  members(@WorkspaceId() workspaceId: string) {
    return this.membersService.findByWorkspace(workspaceId);
  }

  @RequirePermissions('member:invite')
  @Mutation(() => Invitation)
  inviteMember(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: JwtPayload,
    @Args('input') input: InviteMemberInput,
  ) {
    return this.membersService.invite(workspaceId, user.sub, input);
  }

  @RequirePermissions('member:update')
  @Mutation(() => [MemberView])
  updateMemberRole(
    @WorkspaceId() workspaceId: string,
    @Args('input') input: UpdateMemberRoleInput,
  ) {
    return this.membersService.updateRole(workspaceId, input.memberId, input.roleId);
  }

  @RequirePermissions('member:remove')
  @Mutation(() => Boolean)
  removeMember(
    @WorkspaceId() workspaceId: string,
    @Args('memberId') memberId: string,
  ) {
    return this.membersService.remove(workspaceId, memberId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Workspace)
  acceptInvitation(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: AcceptInvitationInput,
  ) {
    return this.membersService.acceptInvitation(input.token, user.sub);
  }
}
