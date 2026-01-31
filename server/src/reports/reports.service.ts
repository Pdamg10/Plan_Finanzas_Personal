import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async getExpensesByCategory(userId: string) {
    // Group by category and sum amount
    const result = await this.transactionsRepository
      .createQueryBuilder('t')
      .leftJoin('t.categoria', 'c')
      .select('c.nombre', 'category')
      .addSelect('SUM(t.monto)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.tipo = :tipo', { tipo: 'gasto' })
      .groupBy('c.nombre')
      .getRawMany();
      
    // Handle cases where category is null (Uncategorized)
    return result.map(r => ({ name: r.category || 'Sin Categoría', value: Number(r.total) }));
  }

  async getIncomeVsExpense(userId: string) {
    const result = await this.transactionsRepository
      .createQueryBuilder('t')
      .select('t.tipo', 'type')
      .addSelect('SUM(t.monto)', 'total')
      .where('t.userId = :userId', { userId })
      .groupBy('t.tipo')
      .getRawMany();

    const income = result.find(r => r.type === 'ingreso')?.total || 0;
    const expense = result.find(r => r.type === 'gasto')?.total || 0;

    return { income: Number(income), expense: Number(expense) };
  }

  async getCashFlow(userId: string) {
      // Last 6 months
      // This is a simplified version; normally handled with precise date ranges
      const result = await this.transactionsRepository
        .createQueryBuilder('t')
        .select("TO_CHAR(t.fecha, 'YYYY-MM')", 'month') // Postgres specific
        .addSelect('SUM(CASE WHEN t.tipo = \'ingreso\' THEN t.monto ELSE 0 END)', 'income')
        .addSelect('SUM(CASE WHEN t.tipo = \'gasto\' THEN t.monto ELSE 0 END)', 'expense')
        .where('t.userId = :userId', { userId })
        .groupBy('month')
        .orderBy('month', 'ASC')
        .limit(6)
        .getRawMany();

      return result.map(r => ({
          month: r.month,
          income: Number(r.income),
          expense: Number(r.expense),
          savings: Number(r.income) - Number(r.expense)
      }));
  }
}
