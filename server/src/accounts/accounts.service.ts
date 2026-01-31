import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  findAll(userId: string): Promise<Account[]> {
    return this.accountsRepository.find({ where: { userId } });
  }

  create(userId: string, accountData: Partial<Account>): Promise<Account> {
    const account = this.accountsRepository.create({ ...accountData, userId });
    return this.accountsRepository.save(account);
  }

  async update(userId: string, id: number, updates: Partial<Account>): Promise<Account> {
    await this.accountsRepository.update({ id, userId }, updates);
    return this.accountsRepository.findOne({ where: { id, userId } });
  }

  async remove(userId: string, id: number): Promise<void> {
    await this.accountsRepository.delete({ id, userId });
  }
}
