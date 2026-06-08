import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  FinancialGoal,
  KanbanTask,
  Transaction,
} from '../database/entities';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SearchResult {
  @Field() type: string;
  @Field() id: string;
  @Field() title: string;
  @Field({ nullable: true }) description?: string;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
    @InjectRepository(FinancialGoal) private goalRepo: Repository<FinancialGoal>,
    @InjectRepository(KanbanTask) private taskRepo: Repository<KanbanTask>,
  ) {}

  async search(workspaceId: string, query: string): Promise<SearchResult[]> {
    const pattern = ILike(`%${query}%`);
    const results: SearchResult[] = [];

    const transactions = await this.transactionRepo.find({
      where: [
        { workspaceId, name: pattern },
        { workspaceId, description: pattern },
      ],
      take: 10,
    });

    for (const t of transactions) {
      results.push({
        type: 'transaction',
        id: t.id,
        title: t.name,
        description: t.description,
      });
    }

    const goals = await this.goalRepo.find({
      where: [
        { workspaceId, title: pattern },
        { workspaceId, description: pattern },
      ],
      take: 10,
    });

    for (const g of goals) {
      results.push({
        type: 'goal',
        id: g.id,
        title: g.title,
        description: g.description,
      });
    }

    const tasks = await this.taskRepo.find({
      where: [
        { workspaceId, title: pattern },
        { workspaceId, description: pattern },
      ],
      take: 10,
    });

    for (const t of tasks) {
      results.push({
        type: 'kanban_task',
        id: t.id,
        title: t.title,
        description: t.description,
      });
    }

    return results;
  }
}
