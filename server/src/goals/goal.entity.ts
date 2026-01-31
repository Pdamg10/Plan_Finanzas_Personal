import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Account } from '../accounts/account.entity';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column('decimal', { precision: 15, scale: 2 })
  monto_objetivo: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  monto_actual: number;

  @Column({ type: 'date', nullable: true })
  fecha_limite: string;

  @ManyToOne(() => Account, { nullable: true })
  cuenta: Account;

  @Column({ nullable: true })
  cuentaId: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
