import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from './dto/workspaces.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Workspace } from '../database/entities';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class UserWorkspace extends Workspace {
  @Field()
  role: string;

  @Field()
  membershipId: string;
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class WorkspacesResolver {
  constructor(private workspacesService: WorkspacesService) {}

  @Query(() => [UserWorkspace])
  myWorkspaces(@CurrentUser() user: JwtPayload) {
    return this.workspacesService.findUserWorkspaces(user.sub);
  }

  @Mutation(() => Workspace)
  createWorkspace(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreateWorkspaceInput,
  ) {
    return this.workspacesService.create(user.sub, input);
  }

  @UseGuards(WorkspaceGuard, PermissionsGuard)
  @RequirePermissions('workspace:update')
  @Mutation(() => Workspace)
  updateWorkspace(
    @WorkspaceId() workspaceId: string,
    @Args('input') input: UpdateWorkspaceInput,
  ) {
    return this.workspacesService.update(workspaceId, input);
  }

  @UseGuards(WorkspaceGuard, PermissionsGuard)
  @RequirePermissions('workspace:delete')
  @Mutation(() => Boolean)
  deleteWorkspace(@WorkspaceId() workspaceId: string) {
    return this.workspacesService.delete(workspaceId);
  }

  @UseGuards(WorkspaceGuard)
  @Query(() => Workspace)
  workspace(@WorkspaceId() workspaceId: string) {
    return this.workspacesService.findById(workspaceId);
  }
}
