import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  CreatePaymentMethodInput,
  PaymentMethodsService,
  UpdatePaymentMethodInput,
} from './payment-methods.service';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PaymentMethod } from '../database/entities';

@Resolver(() => PaymentMethod)
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class PaymentMethodsResolver {
  constructor(private service: PaymentMethodsService) {}

  @Query(() => [PaymentMethod])
  paymentMethods(@WorkspaceId() workspaceId: string) {
    return this.service.findAll(workspaceId);
  }

  @RequirePermissions('payment_method:manage')
  @Mutation(() => PaymentMethod)
  createPaymentMethod(
    @WorkspaceId() workspaceId: string,
    @Args('input') input: CreatePaymentMethodInput,
  ) {
    return this.service.create(workspaceId, input);
  }

  @RequirePermissions('payment_method:manage')
  @Mutation(() => PaymentMethod)
  updatePaymentMethod(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
    @Args('input') input: UpdatePaymentMethodInput,
  ) {
    return this.service.update(id, workspaceId, input);
  }

  @RequirePermissions('payment_method:manage')
  @Mutation(() => Boolean)
  deletePaymentMethod(@WorkspaceId() workspaceId: string, @Args('id') id: string) {
    return this.service.delete(id, workspaceId);
  }
}
