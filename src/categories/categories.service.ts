import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../database/entities';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @Field() @IsNotEmpty() name: string;
  @Field() @IsNotEmpty() slug: string;
  @Field({ nullable: true }) @IsOptional() color?: string;
  @Field({ nullable: true }) @IsOptional() icon?: string;
}

@InputType()
export class UpdateCategoryInput {
  @Field({ nullable: true }) @IsOptional() name?: string;
  @Field({ nullable: true }) @IsOptional() color?: string;
  @Field({ nullable: true }) @IsOptional() icon?: string;
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
    return this.categoryRepo.save({ ...input, workspaceId, isDefault: false });
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
    if (cat.isDefault) throw new NotFoundException('Cannot delete default category');
    await this.categoryRepo.delete(id);
    return true;
  }
}
