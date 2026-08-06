import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeFrequency, IncomeSource, IncomeStream } from '../database/entities';
import { Field, Float, InputType } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateIncomeStreamInput {
  @Field() @IsNotEmpty() incomeSourceId: string;
  @Field(() => Float) expectedAmount: number;
  @Field(() => IncomeFrequency) @IsEnum(IncomeFrequency) frequency: IncomeFrequency;
  @Field() @IsDateString() startDate: string;
  @Field({ nullable: true }) @IsOptional() autoRecord?: boolean;
}

@InputType()
export class UpdateIncomeStreamInput {
  @Field(() => Float, { nullable: true }) @IsOptional() expectedAmount?: number;
  @Field(() => IncomeFrequency, { nullable: true }) @IsOptional() @IsEnum(IncomeFrequency) frequency?: IncomeFrequency;
  @Field({ nullable: true }) @IsOptional() @IsDateString() startDate?: string;
  @Field({ nullable: true }) @IsOptional() autoRecord?: boolean;
}

@Injectable()
export class IncomeStreamsService {
  constructor(
    @InjectRepository(IncomeStream) private streamRepo: Repository<IncomeStream>,
    @InjectRepository(IncomeSource) private sourceRepo: Repository<IncomeSource>,
  ) {}

  findSources(workspaceId: string) {
    return this.sourceRepo.find({ where: { workspaceId }, order: { name: 'ASC' } });
  }

  findAll(workspaceId: string) {
    return this.streamRepo.find({
      where: { workspaceId },
      relations: { incomeSource: true },
      order: { createdAt: 'DESC' },
    });
  }

  create(workspaceId: string, input: CreateIncomeStreamInput) {
    return this.streamRepo.save({
      ...input,
      workspaceId,
      autoRecord: input.autoRecord ?? false,
    });
  }

  async update(id: string, workspaceId: string, input: UpdateIncomeStreamInput) {
    const item = await this.streamRepo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Income stream not found');
    await this.streamRepo.update(id, input);
    return this.streamRepo.findOneOrFail({ where: { id }, relations: { incomeSource: true } });
  }

  async delete(id: string, workspaceId: string) {
    const item = await this.streamRepo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Income stream not found');
    await this.streamRepo.softDelete(id);
    return true;
  }

  async replaceAll(workspaceId: string, inputs: CreateIncomeStreamInput[]) {
    const existing = await this.findAll(workspaceId);
    for (const s of existing) await this.streamRepo.softDelete(s.id);
    const created = [];
    for (const input of inputs) created.push(await this.create(workspaceId, input));
    return created;
  }
}
