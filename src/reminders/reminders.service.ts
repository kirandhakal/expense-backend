import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReminderAssignee,
  ReminderChannel,
  ReminderSetting,
  ReminderTarget,
  ReminderTiming,
} from '../database/entities';
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';

@InputType()
export class CreateReminderSettingInput {
  @Field(() => [ReminderChannel]) channels: ReminderChannel[];
  @Field(() => ReminderTarget) @IsEnum(ReminderTarget) target: ReminderTarget;
  @Field(() => ReminderTiming, { nullable: true }) @IsOptional() @IsEnum(ReminderTiming) timing?: ReminderTiming;
  @Field(() => Int, { nullable: true }) @IsOptional() customDaysBefore?: number;
  @Field(() => ReminderAssignee, { nullable: true }) @IsOptional() @IsEnum(ReminderAssignee) assignTo?: ReminderAssignee;
  @Field({ nullable: true }) @IsOptional() customMemberId?: string;
  @Field({ nullable: true }) @IsOptional() enabled?: boolean;
}

@InputType()
export class UpdateReminderSettingInput {
  @Field(() => [ReminderChannel], { nullable: true }) @IsOptional() channels?: ReminderChannel[];
  @Field(() => ReminderTiming, { nullable: true }) @IsOptional() @IsEnum(ReminderTiming) timing?: ReminderTiming;
  @Field(() => Int, { nullable: true }) @IsOptional() customDaysBefore?: number;
  @Field(() => ReminderAssignee, { nullable: true }) @IsOptional() @IsEnum(ReminderAssignee) assignTo?: ReminderAssignee;
  @Field({ nullable: true }) @IsOptional() customMemberId?: string;
  @Field({ nullable: true }) @IsOptional() enabled?: boolean;
}

@Injectable()
export class RemindersService {
  constructor(@InjectRepository(ReminderSetting) private repo: Repository<ReminderSetting>) {}

  findAll(workspaceId: string) {
    return this.repo.find({ where: { workspaceId }, order: { target: 'ASC' } });
  }

  create(workspaceId: string, input: CreateReminderSettingInput) {
    return this.repo.save({
      ...input,
      workspaceId,
      timing: input.timing || ReminderTiming.ONE_DAY_BEFORE,
      assignTo: input.assignTo || ReminderAssignee.SELF,
      enabled: input.enabled ?? true,
    });
  }

  async update(id: string, workspaceId: string, input: UpdateReminderSettingInput) {
    const item = await this.repo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Reminder setting not found');
    await this.repo.update(id, input);
    return this.repo.findOneOrFail({ where: { id } });
  }

  async delete(id: string, workspaceId: string) {
    const item = await this.repo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Reminder setting not found');
    await this.repo.softDelete(id);
    return true;
  }

  async replaceAll(workspaceId: string, inputs: CreateReminderSettingInput[]) {
    const existing = await this.findAll(workspaceId);
    for (const r of existing) await this.repo.softDelete(r.id);
    const created = [];
    for (const input of inputs) created.push(await this.create(workspaceId, input));
    return created;
  }
}
