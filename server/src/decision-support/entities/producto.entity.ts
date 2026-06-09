import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Category } from '../../categories/category.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  unidad_medida: string; // 'Kg', 'Litros', 'Unidades'

  @Column('decimal', { precision: 15, scale: 2 })
  precio_referencia_cendas: number;

  @Column()
  grupo_nutricional: string; // Proteínas Rojas, Proteínas Avícolas, Carbohidratos, Lácteos, etc.

  @ManyToOne(() => Category, { nullable: true })
  categoria: Category;

  @Column({ nullable: true })
  categoriaId: number;

  @CreateDateColumn()
  created_at: Date;
}
