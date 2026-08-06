import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertRule, AlertType } from '../database/entities';
import { Field, Float, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';

@InputType()
export class CreateAlertRuleInput {
  @Field(() => AlertType) @IsEnum(AlertType) type: AlertType;
  @Field(() => Float, { nullable: true }) @IsOptional() threshold?: number;
  @Field({ nullable: true }) @IsOptional() enabled?: boolean;
}

@InputType()
export class UpdateAlertRuleInput {
  @Field(() => Float, { nullable: true }) @IsOptional() threshold?: number;
  @Field({ nullable: true }) @IsOptional() enabled?: boolean;
}

@Injectable()
export class AlertsService {
  constructor(@InjectRepository(AlertRule) private repo: Repository<AlertRule>) {}

  findAll(workspaceId: string) {
    return this.repo.find({ where: { workspaceId }, order: { type: 'ASC' } });
  }

  create(workspaceId: string, input: CreateAlertRuleInput) {
    return this.repo.save({
      ...input,
      workspaceId,
      enabled: input.enabled ?? true,
    });
  }

  async update(id: string, workspaceId: string, input: UpdateAlertRuleInput) {
    const item = await this.repo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Alert rule not found');
    await this.repo.update(id, input);
    return this.repo.findOneOrFail({ where: { id } });
  }

  async delete(id: string, workspaceId: string) {
    const item = await this.repo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Alert rule not found');
    await this.repo.softDelete(id);
    return true;
  }

  async replaceAll(workspaceId: string, inputs: CreateAlertRuleInput[]) {
    const existing = await this.findAll(workspaceId);
    for (const a of existing) await this.repo.softDelete(a.id);
    const created = [];
    for (const input of inputs) created.push(await this.create(workspaceId, input));
    return created;
  }
}
