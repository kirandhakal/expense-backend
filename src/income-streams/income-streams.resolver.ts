import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  CreateIncomeStreamInput,
  IncomeStreamsService,
  UpdateIncomeStreamInput,
} from './income-streams.service';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { IncomeSource, IncomeStream } from '../database/entities';

@Resolver(() => IncomeStream)
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class IncomeStreamsResolver {
  constructor(private service: IncomeStreamsService) {}

  @Query(() => [IncomeSource])
  incomeSources(@WorkspaceId() workspaceId: string) {
    return this.service.findSources(workspaceId);
  }

  @Query(() => [IncomeStream])
  incomeStreams(@WorkspaceId() workspaceId: string) {
    return this.service.findAll(workspaceId);
  }

  @RequirePermissions('income_stream:manage')
  @Mutation(() => IncomeStream)
  createIncomeStream(
    @WorkspaceId() workspaceId: string,
    @Args('input') input: CreateIncomeStreamInput,
  ) {
    return this.service.create(workspaceId, input);
  }

  @RequirePermissions('income_stream:manage')
  @Mutation(() => IncomeStream)
  updateIncomeStream(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateIncomeStreamInput,
  ) {
    return this.service.update(id, workspaceId, input);
  }

  @RequirePermissions('income_stream:manage')
  @Mutation(() => Boolean)
  deleteIncomeStream(@WorkspaceId() workspaceId: string, @Args('id') id: string) {
    return this.service.delete(id, workspaceId);
  }
}
