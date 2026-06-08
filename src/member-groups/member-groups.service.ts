import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberGroup } from '../database/entities';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateMemberGroupInput {
  @Field() @IsNotEmpty() name: string;
  @Field(() => [String]) memberIds: string[];
  @Field({ nullable: true }) @IsOptional() color?: string;
}

@InputType()
export class UpdateMemberGroupInput {
  @Field({ nullable: true }) @IsOptional() name?: string;
  @Field(() => [String], { nullable: true }) @IsOptional() memberIds?: string[];
  @Field({ nullable: true }) @IsOptional() color?: string;
}

@Injectable()
export class MemberGroupsService {
  constructor(
    @InjectRepository(MemberGroup) private groupRepo: Repository<MemberGroup>,
  ) {}

  findAll(workspaceId: string) {
    return this.groupRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  create(workspaceId: string, userId: string, input: CreateMemberGroupInput) {
    return this.groupRepo.save({ ...input, workspaceId, createdById: userId });
  }

  async update(id: string, workspaceId: string, input: UpdateMemberGroupInput) {
    const group = await this.groupRepo.findOne({ where: { id, workspaceId } });
    if (!group) throw new NotFoundException('Group not found');
    await this.groupRepo.update(id, input);
    return this.groupRepo.findOneOrFail({ where: { id } });
  }

  async delete(id: string, workspaceId: string) {
    const group = await this.groupRepo.findOne({ where: { id, workspaceId } });
    if (!group) throw new NotFoundException('Group not found');
    await this.groupRepo.delete(id);
    return true;
  }
}
