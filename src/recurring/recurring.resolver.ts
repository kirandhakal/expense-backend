import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  CreateRecurringTransactionInput,
  RecurringTransactionsService,
  UpdateRecurringTransactionInput,
} from './recurring.service';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { RecurringTransaction } from '../database/entities';

@Resolver(() => RecurringTransaction)
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class RecurringTransactionsResolver {
  constructor(private service: RecurringTransactionsService) {}

  @Query(() => [RecurringTransaction])
  recurringTransactions(@WorkspaceId() workspaceId: string) {
    return this.service.findAll(workspaceId);
  }

  @RequirePermissions('recurring:manage')
  @Mutation(() => RecurringTransaction)
  createRecurringTransaction(
    @WorkspaceId() workspaceId: string,
    @Args('input') input: CreateRecurringTransactionInput,
  ) {
    return this.service.create(workspaceId, input);
  }

  @RequirePermissions('recurring:manage')
  @Mutation(() => RecurringTransaction)
  updateRecurringTransaction(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateRecurringTransactionInput,
  ) {
    return this.service.update(id, workspaceId, input);
  }

  @RequirePermissions('recurring:manage')
  @Mutation(() => Boolean)
  deleteRecurringTransaction(@WorkspaceId() workspaceId: string, @Args('id') id: string) {
    return this.service.delete(id, workspaceId);
  }
}
