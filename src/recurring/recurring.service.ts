import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IncomeFrequency,
  RecurringDirection,
  RecurringTransaction,
} from '../database/entities';
import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateRecurringTransactionInput {
  @Field() @IsNotEmpty() name: string;
  @Field(() => Float) amount: number;
  @Field(() => IncomeFrequency) @IsEnum(IncomeFrequency) frequency: IncomeFrequency;
  @Field() @IsDateString() startDate: string;
  @Field(() => RecurringDirection) @IsEnum(RecurringDirection) direction: RecurringDirection;
  @Field(() => Int, { nullable: true }) @IsOptional() reminderBeforeDays?: number;
  @Field({ nullable: true }) @IsOptional() autoCreate?: boolean;
  @Field({ nullable: true }) @IsOptional() categoryId?: string;
  @Field({ nullable: true }) @IsOptional() paymentMethodId?: string;
}

@InputType()
export class UpdateRecurringTransactionInput {
  @Field({ nullable: true }) @IsOptional() name?: string;
  @Field(() => Float, { nullable: true }) @IsOptional() amount?: number;
  @Field(() => IncomeFrequency, { nullable: true }) @IsOptional() @IsEnum(IncomeFrequency) frequency?: IncomeFrequency;
  @Field({ nullable: true }) @IsOptional() @IsDateString() startDate?: string;
  @Field(() => Int, { nullable: true }) @IsOptional() reminderBeforeDays?: number;
  @Field({ nullable: true }) @IsOptional() autoCreate?: boolean;
  @Field({ nullable: true }) @IsOptional() isActive?: boolean;
  @Field({ nullable: true }) @IsOptional() categoryId?: string;
  @Field({ nullable: true }) @IsOptional() paymentMethodId?: string;
}

@Injectable()
export class RecurringTransactionsService {
  constructor(
    @InjectRepository(RecurringTransaction) private repo: Repository<RecurringTransaction>,
  ) {}

  findAll(workspaceId: string) {
    return this.repo.find({
      where: { workspaceId },
      relations: { category: true, paymentMethod: true },
      order: { name: 'ASC' },
    });
  }

  create(workspaceId: string, input: CreateRecurringTransactionInput) {
    return this.repo.save({
      ...input,
      workspaceId,
      autoCreate: input.autoCreate ?? true,
      isActive: true,
    });
  }

  async update(id: string, workspaceId: string, input: UpdateRecurringTransactionInput) {
    const item = await this.repo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Recurring transaction not found');
    await this.repo.update(id, input);
    return this.repo.findOneOrFail({
      where: { id },
      relations: { category: true, paymentMethod: true },
    });
  }

  async delete(id: string, workspaceId: string) {
    const item = await this.repo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Recurring transaction not found');
    await this.repo.softDelete(id);
    return true;
  }

  async replaceAll(workspaceId: string, inputs: CreateRecurringTransactionInput[]) {
    const existing = await this.findAll(workspaceId);
    for (const r of existing) await this.repo.softDelete(r.id);
    const created = [];
    for (const input of inputs) created.push(await this.create(workspaceId, input));
    return created;
  }
}
