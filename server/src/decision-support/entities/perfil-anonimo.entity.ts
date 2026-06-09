import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('perfiles_anonimos')
export class PerfilAnonimo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  region_geografica: string;

  @Column('int')
  miembros_hogar: number;

  @Column()
  rango_edad_principal: string; // Ej: '18-24', '25-34', '35-49', '50+'

  @Column('decimal', { precision: 15, scale: 2 })
  ingreso_mensual_neto: number;

  @CreateDateColumn()
  created_at: Date;
}
