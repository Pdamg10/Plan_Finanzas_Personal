import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringTransaction } from './recurring.entity';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class RecurringService {
  constructor(
    @InjectRepository(RecurringTransaction)
    private recurringRepository: Repository<RecurringTransaction>,
    private transactionsService: TransactionsService,
  ) {}

  findAll(userId: string): Promise<RecurringTransaction[]> {
    return this.recurringRepository.find({ where: { userId } });
  }

  create(userId: string, data: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    const rec = this.recurringRepository.create({ ...data, userId });
    return this.recurringRepository.save(rec);
  }

  async update(userId: string, id: number, updates: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    await this.recurringRepository.update({ id, userId }, updates);
    return this.recurringRepository.findOne({ where: { id, userId } });
  }

  async remove(userId: string, id: number): Promise<void> {
    await this.recurringRepository.delete({ id, userId });
  }

  // logic to check and generate transactions
  async processRecurring(userId: string) {
      const active = await this.recurringRepository.find({ where: { userId, active: true } });
      const today = new Date();
      
      for (const rec of active) {
          // Simplified logic: Check if next execution date is due
          // In real app, robust date calculation is needed
          const last = rec.ultima_ejecucion ? new Date(rec.ultima_ejecucion) : new Date(rec.fecha_inicio);
          let next = new Date(last);
          
          if (rec.frecuencia === 'mensual') next.setMonth(next.getMonth() + 1);
          else if (rec.frecuencia === 'semanal') next.setDate(next.getDate() + 7);
          else if (rec.frecuencia === 'anual') next.setFullYear(next.getFullYear() + 1);

          // If never executed, start from start date
          if (!rec.ultima_ejecucion) next = new Date(rec.fecha_inicio);

          if (next <= today) {
              // Create Transaction
              await this.transactionsService.create(userId, {
                  monto: rec.monto,
                  tipo: rec.tipo,
                  descripcion: rec.descripcion + ' (Recurrente)',
                  fecha: next.toISOString().split('T')[0],
                  cuentaId: rec.cuentaId,
                  categoriaId: rec.categoriaId,
                  recurrente: true
              });
              
              // Update last execution
              await this.recurringRepository.update(rec.id, { ultima_ejecucion: next.toISOString().split('T')[0] });
          }
      }
      return { processed: true };
  }
}
