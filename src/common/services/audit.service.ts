import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  async log(params: {
    action: string;
    resource: string;
    resourceId?: string;
    userId?: string;
    sudoUserId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    await this.auditRepo.save(params);
  }
}
