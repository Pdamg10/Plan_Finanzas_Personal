import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Account } from './account.entity';

@Entity('historial_saldos')
export class BalanceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  cuenta: Account;

  @Column()
  cuentaId: number;

  @Column('decimal', { precision: 15, scale: 2 })
  saldo: number;

  @Column({ type: 'date' })
  fecha: string;
}
