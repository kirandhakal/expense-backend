import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Workspace } from '../database/entities';
import { AuditService } from '../common/services/audit.service';
import type { JwtPayload } from '../common/types/jwt-payload.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    private jwtService: JwtService,
    private config: ConfigService,
    private auditService: AuditService,
  ) {}

  async findAll() {
    return this.userRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: Partial<Pick<User, 'firstName' | 'lastName' | 'avatar'>>) {
    await this.userRepo.update(userId, data);
    return this.findById(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.findById(userId);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new ForbiddenException('Current password is incorrect');

    await this.userRepo.update(userId, {
      passwordHash: await bcrypt.hash(newPassword, 12),
    });
    return true;
  }

  async sudoAsUser(admin: JwtPayload, targetUserId: string) {
    if (!admin.isSuperAdmin) {
      throw new ForbiddenException('Super admin access required');
    }

    const target = await this.findById(targetUserId);
    const payload: JwtPayload = {
      sub: target.id,
      email: target.email,
      isSuperAdmin: false,
      sudoUserId: admin.sub,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_SECRET'),
      expiresIn: '15m',
    });

    await this.auditService.log({
      action: 'sudo',
      resource: 'user',
      resourceId: targetUserId,
      userId: admin.sub,
      sudoUserId: admin.sub,
      metadata: { targetEmail: target.email },
    });

    return { accessToken, user: target };
  }

  async deactivateUser(admin: JwtPayload, userId: string) {
    if (!admin.isSuperAdmin) {
      throw new ForbiddenException('Super admin access required');
    }

    await this.userRepo.update(userId, { isActive: false });
    await this.auditService.log({
      action: 'deactivate',
      resource: 'user',
      resourceId: userId,
      userId: admin.sub,
    });
    return true;
  }

  async listAllWorkspaces() {
    return this.workspaceRepo.find({ order: { createdAt: 'DESC' } });
  }
}
