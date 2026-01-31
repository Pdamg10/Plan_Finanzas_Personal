import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ type: 'date' })
  fecha_recordatorio: string; // Renamed from fecha_vencimiento to match schema

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  monto_estimado: number;

  @Column({ nullable: true })
  repeticion: string; // mensual, anual, ninguno

  @Column({ default: true })
  notificar: boolean;

  @Column({ default: false })
  is_read: boolean;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  created_at: Date;
}
