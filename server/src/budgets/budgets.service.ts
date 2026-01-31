import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './budget.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
  ) {}

  findAll(userId: string): Promise<Budget[]> {
    return this.budgetsRepository.find({ where: { userId }, relations: ['categoria'] });
  }

  create(userId: string, data: Partial<Budget>): Promise<Budget> {
    const budget = this.budgetsRepository.create({ ...data, userId });
    return this.budgetsRepository.save(budget);
  }

  async update(userId: string, id: number, updates: Partial<Budget>): Promise<Budget> {
    await this.budgetsRepository.update({ id, userId }, updates);
    return this.budgetsRepository.findOne({ where: { id, userId }, relations: ['categoria'] });
  }

  async remove(userId: string, id: number): Promise<void> {
    await this.budgetsRepository.delete({ id, userId });
  }
}
