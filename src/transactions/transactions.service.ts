import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transaction } from '../database/entities';
import {
  CreateTransactionInput,
  TransactionFilterInput,
  UpdateTransactionInput,
} from './dto/transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
  ) {}

  async findAll(workspaceId: string, filter?: TransactionFilterInput) {
    const where: Record<string, unknown> = { workspaceId };

    if (filter?.type) where.type = filter.type;
    if (filter?.categoryId) where.categoryId = filter.categoryId;
    if (filter?.memberId) where.memberId = filter.memberId;
    if (filter?.startDate && filter?.endDate) {
      where.date = Between(filter.startDate, filter.endDate);
    }

    return this.transactionRepo.find({
      where,
      relations: { category: true, member: true, paymentMethod: true },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(workspaceId: string, userId: string, input: CreateTransactionInput) {
    return this.transactionRepo.save({
      ...input,
      workspaceId,
      createdById: userId,
    });
  }

  async update(id: string, workspaceId: string, input: UpdateTransactionInput) {
    const txn = await this.transactionRepo.findOne({ where: { id, workspaceId } });
    if (!txn) throw new NotFoundException('Transaction not found');

    await this.transactionRepo.update(id, input);
    return this.transactionRepo.findOneOrFail({
      where: { id },
      relations: { category: true, member: true, paymentMethod: true },
    });
  }

  async delete(id: string, workspaceId: string) {
    const txn = await this.transactionRepo.findOne({ where: { id, workspaceId } });
    if (!txn) throw new NotFoundException('Transaction not found');

    await this.transactionRepo.softDelete(id);
    return true;
  }
}
