import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  tipo: string; // efectivo, banco, tarjeta, inversion

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  saldo_inicial: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  saldo_actual: number;

  @Column({ default: true })
  activa: boolean;

  @Column({ default: 'USD' })
  moneda: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
