import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from '../database/entities';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
  ) {}

  async getSummary(workspaceId: string, startDate?: string, endDate?: string) {
    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .where('t.workspaceId = :workspaceId', { workspaceId });

    if (startDate && endDate) {
      qb.andWhere('t.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const transactions = await qb.getMany();

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      totalSavings: totalIncome - totalExpense,
      monthlyChange: 0,
    };
  }

  async getCategoryBreakdown(workspaceId: string, startDate?: string, endDate?: string) {
    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'category')
      .where('t.workspaceId = :workspaceId', { workspaceId })
      .andWhere('t.type = :type', { type: TransactionType.EXPENSE });

    if (startDate && endDate) {
      qb.andWhere('t.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const transactions = await qb.getMany();
    const map = new Map<string, { amount: number; color: string }>();

    for (const t of transactions) {
      const key = t.category?.name || 'Other';
      const color = t.category?.color || '#6b7280';
      const existing = map.get(key) || { amount: 0, color };
      existing.amount += Number(t.amount);
      map.set(key, existing);
    }

    return Array.from(map.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      color: data.color,
    }));
  }

  async getMonthlyData(workspaceId: string) {
    const result = await this.transactionRepo
      .createQueryBuilder('t')
      .select("TO_CHAR(t.date, 'Mon')", 'month')
      .addSelect(
        `SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END)`,
        'income',
      )
      .addSelect(
        `SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END)`,
        'expense',
      )
      .where('t.workspaceId = :workspaceId', { workspaceId })
      .groupBy("TO_CHAR(t.date, 'Mon')")
      .orderBy('MIN(t.date)')
      .getRawMany();

    return result.map((r) => ({
      month: r.month,
      income: Number(r.income),
      expense: Number(r.expense),
    }));
  }

  async getMemberReports(workspaceId: string, startDate?: string, endDate?: string) {
    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.member', 'member')
      .where('t.workspaceId = :workspaceId', { workspaceId })
      .andWhere('t.memberId IS NOT NULL');

    if (startDate && endDate) {
      qb.andWhere('t.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const transactions = await qb.getMany();
    const map = new Map<string, { name: string; income: number; expense: number }>();

    for (const t of transactions) {
      if (!t.member) continue;
      const key = t.memberId!;
      const name = `${t.member.firstName} ${t.member.lastName}`;
      const existing = map.get(key) || { name, income: 0, expense: 0 };

      if (t.type === TransactionType.INCOME) {
        existing.income += Number(t.amount);
      } else {
        existing.expense += Number(t.amount);
      }
      map.set(key, existing);
    }

    return Array.from(map.entries()).map(([memberId, data]) => ({
      memberId,
      ...data,
    }));
  }
}
