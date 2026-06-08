import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import {
  CreateTransactionInput,
  TransactionFilterInput,
  UpdateTransactionInput,
} from './dto/transactions.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Transaction } from '../database/entities';

@Resolver(() => Transaction)
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class TransactionsResolver {
  constructor(private transactionsService: TransactionsService) {}

  @RequirePermissions('transaction:read')
  @Query(() => [Transaction])
  transactions(
    @WorkspaceId() workspaceId: string,
    @Args('filter', { nullable: true }) filter?: TransactionFilterInput,
  ) {
    return this.transactionsService.findAll(workspaceId, filter);
  }

  @RequirePermissions('transaction:create')
  @Mutation(() => Transaction)
  createTransaction(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreateTransactionInput,
  ) {
    return this.transactionsService.create(workspaceId, user.sub, input);
  }

  @RequirePermissions('transaction:update')
  @Mutation(() => Transaction)
  updateTransaction(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateTransactionInput,
  ) {
    return this.transactionsService.update(id, workspaceId, input);
  }

  @RequirePermissions('transaction:delete')
  @Mutation(() => Boolean)
  deleteTransaction(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
  ) {
    return this.transactionsService.delete(id, workspaceId);
  }
}
