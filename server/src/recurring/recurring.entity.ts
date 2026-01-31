import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Account } from '../accounts/account.entity';
import { Category } from '../categories/category.entity';

@Entity('recurring_transactions')
export class RecurringTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tipo: string; // ingreso, gasto

  @Column('decimal', { precision: 15, scale: 2 })
  monto: number;

  @Column()
  descripcion: string;

  @Column()
  frecuencia: string; // semanal, mensual, anual

  @Column({ type: 'date' })
  fecha_inicio: string;

  @Column({ type: 'date', nullable: true })
  fecha_fin: string;

  @Column({ type: 'date', nullable: true })
  ultima_ejecucion: string;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Account, { nullable: true })
  cuenta: Account;

  @Column({ nullable: true })
  cuentaId: number;

  @ManyToOne(() => Category, { nullable: true })
  categoria: Category;

  @Column({ nullable: true })
  categoriaId: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
