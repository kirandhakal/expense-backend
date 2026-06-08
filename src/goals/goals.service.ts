import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialGoal, GoalStatus } from '../database/entities';
import { Field, Float, InputType } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateGoalInput {
  @Field() @IsNotEmpty() title: string;
  @Field(() => Float) targetAmount: number;
  @Field() @IsDateString() deadline: string;
  @Field() @IsNotEmpty() category: string;
  @Field({ nullable: true }) @IsOptional() description?: string;
}

@InputType()
export class UpdateGoalInput {
  @Field({ nullable: true }) @IsOptional() title?: string;
  @Field(() => Float, { nullable: true }) @IsOptional() targetAmount?: number;
  @Field(() => Float, { nullable: true }) @IsOptional() currentAmount?: number;
  @Field({ nullable: true }) @IsOptional() @IsDateString() deadline?: string;
  @Field(() => GoalStatus, { nullable: true }) @IsOptional() @IsEnum(GoalStatus) status?: GoalStatus;
  @Field({ nullable: true }) @IsOptional() category?: string;
  @Field({ nullable: true }) @IsOptional() description?: string;
}

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(FinancialGoal) private goalRepo: Repository<FinancialGoal>,
  ) {}

  findAll(workspaceId: string) {
    return this.goalRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  create(workspaceId: string, userId: string, input: CreateGoalInput) {
    return this.goalRepo.save({ ...input, workspaceId, createdById: userId });
  }

  async update(id: string, workspaceId: string, input: UpdateGoalInput) {
    const goal = await this.goalRepo.findOne({ where: { id, workspaceId } });
    if (!goal) throw new NotFoundException('Goal not found');
    await this.goalRepo.update(id, input);
    return this.goalRepo.findOneOrFail({ where: { id } });
  }

  async delete(id: string, workspaceId: string) {
    const goal = await this.goalRepo.findOne({ where: { id, workspaceId } });
    if (!goal) throw new NotFoundException('Goal not found');
    await this.goalRepo.softDelete(id);
    return true;
  }
}
