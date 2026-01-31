import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './goal.entity';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalsRepository: Repository<Goal>,
  ) {}

  findAll(userId: string): Promise<Goal[]> {
    return this.goalsRepository.find({ where: { userId }, relations: ['cuenta'] });
  }

  create(userId: string, data: Partial<Goal>): Promise<Goal> {
    const goal = this.goalsRepository.create({ ...data, userId });
    return this.goalsRepository.save(goal);
  }

  async update(userId: string, id: number, updates: Partial<Goal>): Promise<Goal> {
    await this.goalsRepository.update({ id, userId }, updates);
    return this.goalsRepository.findOne({ where: { id, userId }, relations: ['cuenta'] });
  }

  async remove(userId: string, id: number): Promise<void> {
    await this.goalsRepository.delete({ id, userId });
  }
}
