import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  findAll(userId: string): Promise<Category[]> {
    return this.categoriesRepository.find({ where: [{ userId }, { is_default: true }] });
  }

  create(userId: string, categoryData: Partial<Category>): Promise<Category> {
    const category = this.categoriesRepository.create({ ...categoryData, userId });
    return this.categoriesRepository.save(category);
  }

  async update(userId: string, id: number, updates: Partial<Category>): Promise<Category> {
    await this.categoriesRepository.update({ id, userId }, updates); // Ensure user owns it
    return this.categoriesRepository.findOne({ where: { id } });
  }

  async remove(userId: string, id: number): Promise<void> {
    const cat = await this.categoriesRepository.findOne({ where: { id, userId } });
    if (cat && !cat.is_default) {
        await this.categoriesRepository.delete(id);
    }
  }
}
