import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecisionSupportController } from './decision-support.controller';
import { DecisionSupportService } from './decision-support.service';
import { Producto } from './entities/producto.entity';
import { PerfilAnonimo } from './entities/perfil-anonimo.entity';
import { RegistroConsumo } from './entities/registro-consumo.entity';
import { EvaluacionMensual } from './entities/evaluacion-mensual.entity';
import { Category } from '../categories/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Producto,
      PerfilAnonimo,
      RegistroConsumo,
      EvaluacionMensual,
      Category
    ]),
  ],
  controllers: [DecisionSupportController],
  providers: [DecisionSupportService],
  exports: [DecisionSupportService],
})
export class DecisionSupportModule {}
