import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  tipo: string; // ingreso, gasto

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  icono: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column()
  userId: string;
  
  @Column({ default: false })
  is_default: boolean;

  @CreateDateColumn()
  created_at: Date;
}
