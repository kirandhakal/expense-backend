import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission, Role, RolePermission } from '../database/entities';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateRoleInput {
  @Field() @IsNotEmpty() name: string;
  @Field(() => [String]) permissionNames: string[];
}

@InputType()
export class UpdateRoleInput {
  @Field({ nullable: true }) @IsOptional() name?: string;
  @Field(() => [String], { nullable: true }) @IsOptional() permissionNames?: string[];
}

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Permission) private permissionRepo: Repository<Permission>,
    @InjectRepository(RolePermission) private rolePermissionRepo: Repository<RolePermission>,
  ) {}

  findAll(workspaceId: string) {
    return this.roleRepo.find({
      where: { workspaceId },
      relations: { rolePermissions: { permission: true } },
    });
  }

  async create(workspaceId: string, input: CreateRoleInput) {
    const role = await this.roleRepo.save({
      name: input.name,
      workspaceId,
      isSystem: false,
    });

    const permissions = await this.permissionRepo.find({
      where: { name: In(input.permissionNames) },
    });

    for (const permission of permissions) {
      await this.rolePermissionRepo.save({ role, permission });
    }

    return this.roleRepo.findOneOrFail({
      where: { id: role.id },
      relations: { rolePermissions: { permission: true } },
    });
  }

  async update(id: string, workspaceId: string, input: UpdateRoleInput) {
    const role = await this.roleRepo.findOne({ where: { id, workspaceId } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) throw new NotFoundException('Cannot modify system role');

    if (input.name) await this.roleRepo.update(id, { name: input.name });

    if (input.permissionNames) {
      await this.rolePermissionRepo.delete({ role: { id } });
      const permissions = await this.permissionRepo.find({
        where: { name: In(input.permissionNames) },
      });
      for (const permission of permissions) {
        await this.rolePermissionRepo.save({ role, permission });
      }
    }

    return this.roleRepo.findOneOrFail({
      where: { id },
      relations: { rolePermissions: { permission: true } },
    });
  }

  async delete(id: string, workspaceId: string) {
    const role = await this.roleRepo.findOne({ where: { id, workspaceId } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) throw new NotFoundException('Cannot delete system role');
    await this.roleRepo.delete(id);
    return true;
  }
}
