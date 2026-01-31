import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './reminder.entity';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private remindersRepository: Repository<Reminder>,
  ) {}

  findAll(userId: string): Promise<Reminder[]> {
    return this.remindersRepository.find({ 
        where: { userId }, 
        order: { fecha_recordatorio: 'ASC' } 
    });
  }

  create(userId: string, data: Partial<Reminder>): Promise<Reminder> {
    const reminder = this.remindersRepository.create({ ...data, userId });
    return this.remindersRepository.save(reminder);
  }

  async remove(userId: string, id: number): Promise<void> {
    await this.remindersRepository.delete({ id, userId });
  }

  async markAsRead(userId: string, id: number): Promise<void> {
      await this.remindersRepository.update({ id, userId }, { is_read: true });
  }
}
