import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../database/entities';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreatePaymentMethodInput {
  @Field() @IsNotEmpty() name: string;
  @Field() @IsNotEmpty() slug: string;
  @Field({ nullable: true }) @IsOptional() icon?: string;
}

@InputType()
export class UpdatePaymentMethodInput {
  @Field({ nullable: true }) @IsOptional() name?: string;
  @Field({ nullable: true }) @IsOptional() icon?: string;
  @Field({ nullable: true }) @IsOptional() isActive?: boolean;
}

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod) private repo: Repository<PaymentMethod>,
  ) {}

  findAll(workspaceId: string) {
    return this.repo.find({ where: { workspaceId }, order: { name: 'ASC' } });
  }

  create(workspaceId: string, input: CreatePaymentMethodInput) {
    return this.repo.save({ ...input, workspaceId, isDefault: false, isActive: true });
  }

  async update(id: string, workspaceId: string, input: UpdatePaymentMethodInput) {
    const item = await this.repo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Payment method not found');
    await this.repo.update(id, input);
    return this.repo.findOneOrFail({ where: { id } });
  }

  async delete(id: string, workspaceId: string) {
    const item = await this.repo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Payment method not found');
    if (item.isDefault) {
      await this.repo.update(id, { isActive: false });
      return true;
    }
    await this.repo.delete(id);
    return true;
  }
}
