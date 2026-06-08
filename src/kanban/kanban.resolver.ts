import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  KanbanService,
  CreateKanbanTaskInput,
  UpdateKanbanTaskInput,
  CreateKanbanColumnInput,
} from './kanban.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { KanbanColumn, KanbanTask } from '../database/entities';

@Resolver()
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class KanbanResolver {
  constructor(private kanbanService: KanbanService) {}

  @RequirePermissions('kanban:manage')
  @Query(() => [KanbanColumn])
  kanbanColumns(@WorkspaceId() workspaceId: string) {
    return this.kanbanService.findColumns(workspaceId);
  }

  @RequirePermissions('kanban:manage')
  @Query(() => [KanbanTask])
  kanbanTasks(@WorkspaceId() workspaceId: string) {
    return this.kanbanService.findTasks(workspaceId);
  }

  @RequirePermissions('kanban:manage')
  @Mutation(() => KanbanTask)
  createKanbanTask(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreateKanbanTaskInput,
  ) {
    return this.kanbanService.createTask(workspaceId, user.sub, input);
  }

  @RequirePermissions('kanban:manage')
  @Mutation(() => KanbanTask)
  updateKanbanTask(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateKanbanTaskInput,
  ) {
    return this.kanbanService.updateTask(id, workspaceId, input);
  }

  @RequirePermissions('kanban:manage')
  @Mutation(() => Boolean)
  deleteKanbanTask(@WorkspaceId() workspaceId: string, @Args('id') id: string) {
    return this.kanbanService.deleteTask(id, workspaceId);
  }

  @RequirePermissions('kanban:manage')
  @Mutation(() => KanbanColumn)
  createKanbanColumn(
    @WorkspaceId() workspaceId: string,
    @Args('input') input: CreateKanbanColumnInput,
  ) {
    return this.kanbanService.createColumn(workspaceId, input);
  }
}
