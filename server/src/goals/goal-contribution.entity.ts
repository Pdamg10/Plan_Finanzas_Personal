import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Goal } from './goal.entity';
import { Account } from '../accounts/account.entity';

@Entity('aportes_meta')
export class GoalContribution {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Goal, { onDelete: 'CASCADE' })
  meta: Goal;

  @Column()
  metaId: number;

  @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
  cuenta: Account;

  @Column({ nullable: true })
  cuentaId: number;

  @Column('decimal', { precision: 15, scale: 2 })
  monto: number;

  @Column({ type: 'date' })
  fecha: string;

  @CreateDateColumn()
  creado_en: Date;
}
