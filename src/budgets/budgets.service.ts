import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget, BudgetStrategy, BudgetType } from '../database/entities';
import { Field, Float, InputType } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

@InputType()
export class CreateBudgetInput {
  @Field(() => BudgetType) @IsEnum(BudgetType) type: BudgetType;
  @Field(() => BudgetStrategy, { nullable: true }) @IsOptional() @IsEnum(BudgetStrategy) strategy?: BudgetStrategy;
  @Field(() => Float) amount: number;
  @Field({ nullable: true }) @IsOptional() @IsDateString() periodStart?: string;
  @Field({ nullable: true }) @IsOptional() @IsDateString() periodEnd?: string;
  @Field({ nullable: true }) @IsOptional() categoryId?: string;
}

@InputType()
export class UpdateBudgetInput {
  @Field(() => BudgetType, { nullable: true }) @IsOptional() @IsEnum(BudgetType) type?: BudgetType;
  @Field(() => BudgetStrategy, { nullable: true }) @IsOptional() @IsEnum(BudgetStrategy) strategy?: BudgetStrategy;
  @Field(() => Float, { nullable: true }) @IsOptional() amount?: number;
  @Field({ nullable: true }) @IsOptional() @IsDateString() periodStart?: string;
  @Field({ nullable: true }) @IsOptional() @IsDateString() periodEnd?: string;
  @Field({ nullable: true }) @IsOptional() categoryId?: string;
}

@Injectable()
export class BudgetsService {
  constructor(@InjectRepository(Budget) private repo: Repository<Budget>) {}

  findAll(workspaceId: string) {
    return this.repo.find({
      where: { workspaceId },
      relations: { category: true },
      order: { createdAt: 'DESC' },
    });
  }

  create(workspaceId: string, input: CreateBudgetInput) {
    return this.repo.save({
      ...input,
      workspaceId,
      strategy: input.strategy || BudgetStrategy.FIXED,
    });
  }

  async update(id: string, workspaceId: string, input: UpdateBudgetInput) {
    const item = await this.repo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Budget not found');
    await this.repo.update(id, input);
    return this.repo.findOneOrFail({ where: { id }, relations: { category: true } });
  }

  async delete(id: string, workspaceId: string) {
    const item = await this.repo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Budget not found');
    await this.repo.softDelete(id);
    return true;
  }

  async replacePrimary(workspaceId: string, input: CreateBudgetInput) {
    const existing = await this.findAll(workspaceId);
    for (const b of existing) {
      if (b.type === input.type && !input.categoryId) {
        await this.repo.softDelete(b.id);
      }
    }
    return this.create(workspaceId, input);
  }
}
