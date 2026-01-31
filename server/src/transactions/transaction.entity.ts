import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Account } from '../accounts/account.entity';
import { Category } from '../categories/category.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 15, scale: 2 })
  monto: number;

  @Column()
  tipo: string; // ingreso, gasto, transferencia

  @Column({ nullable: true })
  descripcion: string;

  @Column({ type: 'date' })
  fecha: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Account, { nullable: true })
  cuenta: Account;

  @Column({ nullable: true })
  cuentaId: number;
  
  // For transfers
  @ManyToOne(() => Account, { nullable: true })
  cuenta_destino: Account;

  @Column({ nullable: true })
  cuentaDestinoId: number;

  @ManyToOne(() => Category, { nullable: true })
  categoria: Category;

  @Column({ nullable: true })
  categoriaId: number;

  @Column({ default: false })
  recurrente: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
