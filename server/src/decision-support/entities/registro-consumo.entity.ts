import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { PerfilAnonimo } from './perfil-anonimo.entity';
import { Producto } from './producto.entity';

@Entity('registros_consumo')
export class RegistroConsumo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PerfilAnonimo, { onDelete: 'CASCADE' })
  perfilAnonimo: PerfilAnonimo;

  @Column()
  perfilAnonimoId: string;

  @ManyToOne(() => Producto)
  producto: Producto;

  @Column()
  productoId: number;

  @Column('decimal', { precision: 10, scale: 3 })
  cantidad: number;

  @Column('decimal', { precision: 15, scale: 2 })
  precio_unitario_pagado: number;

  @Column('decimal', { precision: 8, scale: 4 })
  inflacion_calculada: number; // Delta porcentual respecto al precio base

  @Column({ type: 'date' })
  fecha: string;

  @CreateDateColumn()
  created_at: Date;
}
