import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Resolver(() => AuditLog)
@UseGuards(JwtAuthGuard)
export class AuditResolver {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  @Query(() => [AuditLog])
  auditLogs(@CurrentUser() user: JwtPayload) {
    if (!user.isSuperAdmin) {
      throw new ForbiddenException('Super admin access required');
    }
    return this.auditRepo.find({ order: { createdAt: 'DESC' }, take: 100 });
  }
}
