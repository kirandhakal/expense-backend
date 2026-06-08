import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanColumn, KanbanTask, TaskPriority } from '../database/entities';
import { Field, InputType } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class CreateKanbanTaskInput {
  @Field() @IsNotEmpty() title: string;
  @Field({ nullable: true }) @IsOptional() description?: string;
  @Field() @IsUUID() columnId: string;
  @Field(() => TaskPriority, { nullable: true }) @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @Field({ nullable: true }) @IsOptional() @IsUUID() assigneeId?: string;
  @Field({ nullable: true }) @IsOptional() @IsDateString() dueDate?: string;
  @Field({ nullable: true }) @IsOptional() dueTime?: string;
  @Field(() => [String], { nullable: true }) @IsOptional() tags?: string[];
}

@InputType()
export class UpdateKanbanTaskInput {
  @Field({ nullable: true }) @IsOptional() title?: string;
  @Field({ nullable: true }) @IsOptional() description?: string;
  @Field({ nullable: true }) @IsOptional() @IsUUID() columnId?: string;
  @Field(() => TaskPriority, { nullable: true }) @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @Field({ nullable: true }) @IsOptional() @IsUUID() assigneeId?: string;
  @Field({ nullable: true }) @IsOptional() @IsDateString() dueDate?: string;
  @Field({ nullable: true }) @IsOptional() dueTime?: string;
  @Field(() => [String], { nullable: true }) @IsOptional() tags?: string[];
  @Field({ nullable: true }) @IsOptional() order?: number;
}

@InputType()
export class CreateKanbanColumnInput {
  @Field() @IsNotEmpty() name: string;
  @Field() @IsNotEmpty() slug: string;
}

@Injectable()
export class KanbanService {
  constructor(
    @InjectRepository(KanbanTask) private taskRepo: Repository<KanbanTask>,
    @InjectRepository(KanbanColumn) private columnRepo: Repository<KanbanColumn>,
  ) {}

  findColumns(workspaceId: string) {
    return this.columnRepo.find({
      where: { workspaceId },
      order: { order: 'ASC' },
    });
  }

  findTasks(workspaceId: string) {
    return this.taskRepo.find({
      where: { workspaceId },
      relations: { column: true, assignee: true },
      order: { order: 'ASC' },
    });
  }

  createTask(workspaceId: string, userId: string, input: CreateKanbanTaskInput) {
    return this.taskRepo.save({
      ...input,
      workspaceId,
      createdById: userId,
      tags: input.tags || [],
    });
  }

  async updateTask(id: string, workspaceId: string, input: UpdateKanbanTaskInput) {
    const task = await this.taskRepo.findOne({ where: { id, workspaceId } });
    if (!task) throw new NotFoundException('Task not found');
    await this.taskRepo.update(id, input);
    return this.taskRepo.findOneOrFail({ where: { id }, relations: { column: true, assignee: true } });
  }

  async deleteTask(id: string, workspaceId: string) {
    const task = await this.taskRepo.findOne({ where: { id, workspaceId } });
    if (!task) throw new NotFoundException('Task not found');
    await this.taskRepo.softDelete(id);
    return true;
  }

  createColumn(workspaceId: string, input: CreateKanbanColumnInput) {
    return this.columnRepo.save({ ...input, workspaceId });
  }
}
