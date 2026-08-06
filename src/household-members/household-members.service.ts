import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HouseholdMember, HouseholdMemberRole } from '../database/entities';
import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateHouseholdMemberInput {
  @Field() @IsNotEmpty() name: string;
  @Field() @IsNotEmpty() relationship: string;
  @Field({ nullable: true }) @IsOptional() @IsEmail() email?: string;
  @Field({ nullable: true }) @IsOptional() phone?: string;
  @Field(() => HouseholdMemberRole, { nullable: true })
  @IsOptional()
  @IsEnum(HouseholdMemberRole)
  roleKey?: HouseholdMemberRole;
}

@InputType()
export class UpdateHouseholdMemberInput {
  @Field({ nullable: true }) @IsOptional() name?: string;
  @Field({ nullable: true }) @IsOptional() relationship?: string;
  @Field({ nullable: true }) @IsOptional() @IsEmail() email?: string;
  @Field({ nullable: true }) @IsOptional() phone?: string;
  @Field(() => HouseholdMemberRole, { nullable: true })
  @IsOptional()
  @IsEnum(HouseholdMemberRole)
  roleKey?: HouseholdMemberRole;
}

@Injectable()
export class HouseholdMembersService {
  constructor(
    @InjectRepository(HouseholdMember) private repo: Repository<HouseholdMember>,
  ) {}

  findAll(workspaceId: string) {
    return this.repo.find({ where: { workspaceId }, order: { name: 'ASC' } });
  }

  create(workspaceId: string, input: CreateHouseholdMemberInput) {
    return this.repo.save({
      ...input,
      workspaceId,
      roleKey: input.roleKey || HouseholdMemberRole.MEMBER,
    });
  }

  async update(id: string, workspaceId: string, input: UpdateHouseholdMemberInput) {
    const item = await this.repo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Household member not found');
    await this.repo.update(id, input);
    return this.repo.findOneOrFail({ where: { id } });
  }

  async delete(id: string, workspaceId: string) {
    const item = await this.repo.findOne({ where: { id, workspaceId } });
    if (!item) throw new NotFoundException('Household member not found');
    await this.repo.softDelete(id);
    return true;
  }

  async replaceAll(workspaceId: string, members: CreateHouseholdMemberInput[]) {
    const existing = await this.findAll(workspaceId);
    for (const m of existing) {
      await this.repo.softDelete(m.id);
    }
    const created = [];
    for (const input of members) {
      created.push(await this.create(workspaceId, input));
    }
    return created;
  }
}
