import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Workspace,
  WorkspaceMember,
} from '../database/entities';
import { SeedService } from '../database/seed/seed.service';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from './dto/workspaces.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember) private memberRepo: Repository<WorkspaceMember>,
    private seedService: SeedService,
  ) {}

  async findUserWorkspaces(userId: string) {
    const memberships = await this.memberRepo.find({
      where: { userId, isActive: true },
      relations: { workspace: true, role: true },
    });
    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role.name,
      membershipId: m.id,
    }));
  }

  async create(userId: string, input: CreateWorkspaceInput) {
    const workspace = await this.workspaceRepo.save({
      ...input,
      currency: input.currency || 'USD',
    });

    await this.seedService.seedWorkspaceDefaults(workspace.id);
    const ownerRole = await this.seedService.createSystemRoles(workspace.id);

    await this.memberRepo.save({
      userId,
      workspaceId: workspace.id,
      roleId: ownerRole.id,
    });

    return workspace;
  }

  async update(workspaceId: string, input: UpdateWorkspaceInput) {
    const { settings, ...rest } = input;
    const updateData: Record<string, unknown> = { ...rest };
    if (settings !== undefined) updateData.settings = settings;
    await this.workspaceRepo.update(workspaceId, updateData);
    return this.findById(workspaceId);
  }

  async findById(id: string) {
    const workspace = await this.workspaceRepo.findOne({ where: { id } });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async delete(workspaceId: string) {
    await this.workspaceRepo.softDelete(workspaceId);
    return true;
  }
}
