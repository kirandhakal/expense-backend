import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryKind } from '../database/entities';
import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @Field() @IsNotEmpty() name: string;
  @Field() @IsNotEmpty() slug: string;
  @Field({ nullable: true }) @IsOptional() color?: string;
  @Field({ nullable: true }) @IsOptional() icon?: string;
  @Field({ nullable: true }) @IsOptional() parentId?: string;
  @Field(() => CategoryKind, { nullable: true }) @IsOptional() @IsEnum(CategoryKind) kind?: CategoryKind;
}

@InputType()
export class UpdateCategoryInput {
  @Field({ nullable: true }) @IsOptional() name?: string;
  @Field({ nullable: true }) @IsOptional() color?: string;
  @Field({ nullable: true }) @IsOptional() icon?: string;
  @Field({ nullable: true }) @IsOptional() isActive?: boolean;
  @Field({ nullable: true }) @IsOptional() parentId?: string;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  findAll(workspaceId: string) {
    return this.categoryRepo.find({
      where: { workspaceId },
      order: { name: 'ASC' },
    });
  }

  create(workspaceId: string, input: CreateCategoryInput) {
    return this.categoryRepo.save({
      ...input,
      workspaceId,
      isDefault: false,
      isActive: true,
      kind: input.kind || CategoryKind.EXPENSE,
    });
  }

  async update(id: string, workspaceId: string, input: UpdateCategoryInput) {
    const cat = await this.categoryRepo.findOne({ where: { id, workspaceId } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.categoryRepo.update(id, input);
    return this.categoryRepo.findOneOrFail({ where: { id } });
  }

  async delete(id: string, workspaceId: string) {
    const cat = await this.categoryRepo.findOne({ where: { id, workspaceId } });
    if (!cat) throw new NotFoundException('Category not found');
    if (cat.isDefault) {
      await this.categoryRepo.update(id, { isActive: false });
      return true;
    }
    await this.categoryRepo.delete(id);
    return true;
  }
}
