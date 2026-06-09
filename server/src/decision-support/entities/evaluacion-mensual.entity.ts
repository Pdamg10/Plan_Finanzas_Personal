import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { PerfilAnonimo } from './perfil-anonimo.entity';

@Entity('evaluaciones_mensuales')
export class EvaluacionMensual {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PerfilAnonimo, { onDelete: 'CASCADE' })
  perfilAnonimo: PerfilAnonimo;

  @Column()
  perfilAnonimoId: string;

  @Column({ type: 'date' })
  periodo: string; // Formato YYYY-MM-01

  @Column('decimal', { precision: 15, scale: 2 })
  costo_alimentario_total: number;

  @Column('decimal', { precision: 5, scale: 2 })
  porcentaje_ahorro_previo: number;

  @Column('decimal', { precision: 6, scale: 2 })
  indice_vulnerabilidad_cepal: number;

  @Column()
  clasificacion_cepal: string; // 'Bienestar' | 'Vulnerabilidad' | 'Pobreza'

  @Column()
  estado_semaforo: string; // 'Verde' | 'Amarillo' | 'Rojo'

  @CreateDateColumn()
  created_at: Date;
}
