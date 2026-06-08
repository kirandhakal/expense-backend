import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RolesService, CreateRoleInput, UpdateRoleInput } from './roles.service';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Role } from '../database/entities';

@Resolver(() => Role)
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class RolesResolver {
  constructor(private rolesService: RolesService) {}

  @Query(() => [Role])
  roles(@WorkspaceId() workspaceId: string) {
    return this.rolesService.findAll(workspaceId);
  }

  @RequirePermissions('role:manage')
  @Mutation(() => Role)
  createRole(
    @WorkspaceId() workspaceId: string,
    @Args('input') input: CreateRoleInput,
  ) {
    return this.rolesService.create(workspaceId, input);
  }

  @RequirePermissions('role:manage')
  @Mutation(() => Role)
  updateRole(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateRoleInput,
  ) {
    return this.rolesService.update(id, workspaceId, input);
  }

  @RequirePermissions('role:manage')
  @Mutation(() => Boolean)
  deleteRole(@WorkspaceId() workspaceId: string, @Args('id') id: string) {
    return this.rolesService.delete(id, workspaceId);
  }
}
