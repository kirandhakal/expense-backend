import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  CategoriesService,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './categories.service';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Category } from '../database/entities';

@Resolver(() => Category)
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class CategoriesResolver {
  constructor(private categoriesService: CategoriesService) {}

  @Query(() => [Category])
  categories(@WorkspaceId() workspaceId: string) {
    return this.categoriesService.findAll(workspaceId);
  }

  @RequirePermissions('category:manage')
  @Mutation(() => Category)
  createCategory(
    @WorkspaceId() workspaceId: string,
    @Args('input') input: CreateCategoryInput,
  ) {
    return this.categoriesService.create(workspaceId, input);
  }

  @RequirePermissions('category:manage')
  @Mutation(() => Category)
  updateCategory(
    @WorkspaceId() workspaceId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateCategoryInput,
  ) {
    return this.categoriesService.update(id, workspaceId, input);
  }

  @RequirePermissions('category:manage')
  @Mutation(() => Boolean)
  deleteCategory(@WorkspaceId() workspaceId: string, @Args('id') id: string) {
    return this.categoriesService.delete(id, workspaceId);
  }
}
