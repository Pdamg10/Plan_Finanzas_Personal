import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { PerfilAnonimo } from './entities/perfil-anonimo.entity';
import { RegistroConsumo } from './entities/registro-consumo.entity';
import { EvaluacionMensual } from './entities/evaluacion-mensual.entity';
import { Category } from '../categories/category.entity';
import { EvaluateBudgetDto } from './dto/evaluate-budget.dto';

export interface EvaluacionResultado {
  costoCanastaAlimentaria: number;
  indiceVulnerabilidadCepal: number;
  clasificacionCepal: 'Bienestar' | 'Vulnerabilidad' | 'Pobreza';
  ahorroObligatorioDescontado: number;
  presupuestoDisponibleRestante: number;
  totalGastosComprometidos: number;
  estadoSemaforo: 'Verde' | 'Amarillo' | 'Rojo';
  explicacionSemaforo: string;
  sustitucionesSugeridas: Array<{
    productoOriginal: string;
    grupoNutricional: string;
    precioPagado: number;
    precioCendasReferencia: number;
    inflacionRegistrada: number;
    productoSustitutoSugerido: string;
    precioSustitutoReferencia: number;
    ahorroEstimadoPorUnidad: number;
  }>;
  reporteGenerativo: string;
  indiceEsfuerzoLaboral: number; // IELE (días de trabajo para cubrir alimentos)
}

@Injectable()
export class DecisionSupportService implements OnModuleInit {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(PerfilAnonimo)
    private readonly perfilRepository: Repository<PerfilAnonimo>,
    @InjectRepository(RegistroConsumo)
    private readonly consumoRepository: Repository<RegistroConsumo>,
    @InjectRepository(EvaluacionMensual)
    private readonly evaluacionRepository: Repository<EvaluacionMensual>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    console.log('🔄 Checking default categories and CENDAS products...');
    await this.ensureStaticCategoriesAndProducts();
  }

  private async ensureStaticCategoriesAndProducts() {
    const defaultCategories = [
      { nombre: 'Alimentación', tipo: 'gasto', is_default: true, color: '#e74c3c', icono: 'Utensils' },
      { nombre: 'Vivienda y Servicios Públicos', tipo: 'gasto', is_default: true, color: '#3498db', icono: 'Home' },
      { nombre: 'Salud', tipo: 'gasto', is_default: true, color: '#2ecc71', icono: 'HeartPulse' },
      { nombre: 'Educación', tipo: 'gasto', is_default: true, color: '#9b59b6', icono: 'GraduationCap' },
      { nombre: 'Vestido y Calzado', tipo: 'gasto', is_default: true, color: '#e67e22', icono: 'Shirt' },
      { nombre: 'Artículos de Higiene Personal y Limpieza del Hogar', tipo: 'gasto', is_default: true, color: '#1abc9c', icono: 'Sparkles' },
      { nombre: 'Transporte', tipo: 'gasto', is_default: true, color: '#f1c40f', icono: 'Car' },
    ];

    // Delete old categories that don't match our exact 7 master categories to prevent mismatch
    const validNames = defaultCategories.map(c => c.nombre);
    try {
      await this.categoryRepository.createQueryBuilder()
        .delete()
        .from(Category)
        .where('is_default = true AND nombre NOT IN (:...names)', { names: validNames })
        .execute();
    } catch (err) {
      console.warn('Error clearing old default categories:', err.message);
    }

    const categoryMap = new Map<string, Category>();

    for (const cat of defaultCategories) {
      let category = await this.categoryRepository.findOne({ where: { nombre: cat.nombre, is_default: true } });
      if (!category) {
        category = this.categoryRepository.create({
          nombre: cat.nombre,
          tipo: cat.tipo,
          is_default: true,
          color: cat.color,
          icono: cat.icono,
          userId: null,
        });
        category = await this.categoryRepository.save(category);
        console.log(`✅ Created default category: ${cat.nombre}`);
      }
      categoryMap.set(cat.nombre, category);
    }

    const count = await this.productoRepository.count();
    if (count !== 60) {
      console.log('🌱 Clearing and populating exactly 60 standardized CENDAS basic basket products...');
      try {
        await this.productoRepository.createQueryBuilder().delete().from(Producto).execute();
      } catch (err) {
        console.warn('Error clearing old products:', err.message);
      }
      
      const rawProducts = [
        // 1. Cereales y Productos Derivados (10 items)
        { nombre: 'Harina de maíz precocida', unidad: 'Kg', precio: 1.10, grupo: 'Cereales y Derivados', cat: 'Alimentación' },
        { nombre: 'Harina de trigo', unidad: 'Kg', precio: 1.35, grupo: 'Cereales y Derivados', cat: 'Alimentación' },
        { nombre: 'Arroz blanco', unidad: 'Kg', precio: 1.00, grupo: 'Cereales y Derivados', cat: 'Alimentación' },
        { nombre: 'Pasta alimenticia (Espagueti)', unidad: 'Kg', precio: 1.25, grupo: 'Cereales y Derivados', cat: 'Alimentación' },
        { nombre: 'Pan de panadería', unidad: 'Kg', precio: 2.20, grupo: 'Cereales y Derivados', cat: 'Alimentación' },
        { nombre: 'Pan de sándwich', unidad: 'Unidades', precio: 1.80, grupo: 'Cereales y Derivados', cat: 'Alimentación' },
        { nombre: 'Avena en hojuelas', unidad: 'Kg', precio: 2.50, grupo: 'Cereales y Derivados', cat: 'Alimentación' },
        { nombre: 'Galletas de soda', unidad: 'Unidades', precio: 0.90, grupo: 'Cereales y Derivados', cat: 'Alimentación' },
        { nombre: 'Galletas dulces', unidad: 'Unidades', precio: 0.85, grupo: 'Cereales y Derivados', cat: 'Alimentación' },
        { nombre: 'Fororo', unidad: 'Kg', precio: 1.40, grupo: 'Cereales y Derivados', cat: 'Alimentación' },

        // 2. Carnes y sus Preparados (7 items)
        { nombre: 'Carne de res de primera (Bisteck)', unidad: 'Kg', precio: 8.50, grupo: 'Carnes', cat: 'Alimentación' },
        { nombre: 'Carne de res de segunda (Molida)', unidad: 'Kg', precio: 6.80, grupo: 'Carnes', cat: 'Alimentación' },
        { nombre: 'Carne de cerdo (Chuleta)', unidad: 'Kg', precio: 5.50, grupo: 'Carnes', cat: 'Alimentación' },
        { nombre: 'Pollo entero', unidad: 'Kg', precio: 3.20, grupo: 'Carnes', cat: 'Alimentación' },
        { nombre: 'Jamón cocido', unidad: 'Kg', precio: 7.20, grupo: 'Carnes', cat: 'Alimentación' },
        { nombre: 'Mortadela', unidad: 'Kg', precio: 4.50, grupo: 'Carnes', cat: 'Alimentación' },
        { nombre: 'Salchichas', unidad: 'Kg', precio: 3.80, grupo: 'Carnes', cat: 'Alimentación' },

        // 3. Pescados y Mariscos (4 items)
        { nombre: 'Pescado fresco', unidad: 'Kg', precio: 4.80, grupo: 'Pescados y Mariscos', cat: 'Alimentación' },
        { nombre: 'Pescado salado', unidad: 'Kg', precio: 5.50, grupo: 'Pescados y Mariscos', cat: 'Alimentación' },
        { nombre: 'Atún enlatado', unidad: 'Unidades', precio: 1.50, grupo: 'Pescados y Mariscos', cat: 'Alimentación' },
        { nombre: 'Sardinas enlatadas', unidad: 'Unidades', precio: 0.95, grupo: 'Pescados y Mariscos', cat: 'Alimentación' },

        // 4. Leche, Quesos y Huevos (7 items)
        { nombre: 'Leche en polvo', unidad: 'Kg', precio: 7.80, grupo: 'Leche, Quesos y Huevos', cat: 'Alimentación' },
        { nombre: 'Leche líquida pasteurizada', unidad: 'Litros', precio: 1.40, grupo: 'Leche, Quesos y Huevos', cat: 'Alimentación' },
        { nombre: 'Queso blanco duro (Llanero)', unidad: 'Kg', precio: 4.80, grupo: 'Leche, Quesos y Huevos', cat: 'Alimentación' },
        { nombre: 'Queso amarillo', unidad: 'Kg', precio: 7.50, grupo: 'Leche, Quesos y Huevos', cat: 'Alimentación' },
        { nombre: 'Queso blanco suave', unidad: 'Kg', precio: 5.20, grupo: 'Leche, Quesos y Huevos', cat: 'Alimentación' },
        { nombre: 'Mantequilla', unidad: 'Kg', precio: 3.80, grupo: 'Leche, Quesos y Huevos', cat: 'Alimentación' },
        { nombre: 'Huevos de gallina', unidad: 'Unidades', precio: 0.15, grupo: 'Leche, Quesos y Huevos', cat: 'Alimentación' },

        // 5. Grasas y Aceites (3 items)
        { nombre: 'Aceite vegetal de cocina', unidad: 'Litros', precio: 2.10, grupo: 'Grasas y Aceites', cat: 'Alimentación' },
        { nombre: 'Margarina', unidad: 'Kg', precio: 3.20, grupo: 'Grasas y Aceites', cat: 'Alimentación' },
        { nombre: 'Mayonesa', unidad: 'Kg', precio: 3.50, grupo: 'Grasas y Aceites', cat: 'Alimentación' },

        // 6. Frutas y Hortalizas (15 items)
        { nombre: 'Tomate', unidad: 'Kg', precio: 1.80, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Cebolla', unidad: 'Kg', precio: 1.50, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Pimentón', unidad: 'Kg', precio: 2.20, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Zanahoria', unidad: 'Kg', precio: 1.30, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Repollo', unidad: 'Kg', precio: 0.80, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Ajo', unidad: 'Kg', precio: 4.50, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Aliños varios (Cebollín/Ají)', unidad: 'Kg', precio: 1.60, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Cambur', unidad: 'Kg', precio: 1.10, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Lechosa', unidad: 'Kg', precio: 0.90, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Naranja', unidad: 'Kg', precio: 1.20, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Piña', unidad: 'Kg', precio: 1.30, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Melón', unidad: 'Kg', precio: 1.40, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Limón', unidad: 'Kg', precio: 1.50, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Guayaba', unidad: 'Kg', precio: 1.25, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },
        { nombre: 'Aguacate', unidad: 'Kg', precio: 2.50, grupo: 'Frutas y Hortalizas', cat: 'Alimentación' },

        // 7. Raíces, Tubérculos y Otros (5 items)
        { nombre: 'Papa', unidad: 'Kg', precio: 1.60, grupo: 'Raíces, Tubérculos y Otros', cat: 'Alimentación' },
        { nombre: 'Yuca', unidad: 'Kg', precio: 0.90, grupo: 'Raíces, Tubérculos y Otros', cat: 'Alimentación' },
        { nombre: 'Plátano', unidad: 'Kg', precio: 1.10, grupo: 'Raíces, Tubérculos y Otros', cat: 'Alimentación' },
        { nombre: 'Ocumo', unidad: 'Kg', precio: 1.45, grupo: 'Raíces, Tubérculos y Otros', cat: 'Alimentación' },
        { nombre: 'Apio', unidad: 'Kg', precio: 1.35, grupo: 'Raíces, Tubérculos y Otros', cat: 'Alimentación' },

        // 8. Leguminosas / Granos (4 items)
        { nombre: 'Caraotas negras', unidad: 'Kg', precio: 2.10, grupo: 'Leguminosas / Granos', cat: 'Alimentación' },
        { nombre: 'Lentejas', unidad: 'Kg', precio: 2.30, grupo: 'Leguminosas / Granos', cat: 'Alimentación' },
        { nombre: 'Arvejas', unidad: 'Kg', precio: 2.00, grupo: 'Leguminosas / Granos', cat: 'Alimentación' },
        { nombre: 'Frijoles', unidad: 'Kg', precio: 1.95, grupo: 'Leguminosas / Granos', cat: 'Alimentación' },

        // 9. Azúcar y Similares (2 items)
        { nombre: 'Azúcar refinada', unidad: 'Kg', precio: 1.20, grupo: 'Azúcar y Similares', cat: 'Alimentación' },
        { nombre: 'Papelón', unidad: 'Kg', precio: 1.50, grupo: 'Azúcar y Similares', cat: 'Alimentación' },

        // 10. Salsas y Condimentos (2 items)
        { nombre: 'Salsa de tomate (Ketchup)', unidad: 'Kg', precio: 2.50, grupo: 'Salsas y Condimentos', cat: 'Alimentación' },
        { nombre: 'Vinagre', unidad: 'Litros', precio: 1.10, grupo: 'Salsas y Condimentos', cat: 'Alimentación' },

        // 11. Café (1 item)
        { nombre: 'Café molido', unidad: 'Kg', precio: 6.50, grupo: 'Café', cat: 'Alimentación' },
      ];

      for (const raw of rawProducts) {
        const catObj = categoryMap.get(raw.cat);
        const prod = this.productoRepository.create({
          nombre: raw.nombre,
          unidad_medida: raw.unidad,
          precio_referencia_cendas: raw.precio,
          grupo_nutricional: raw.grupo,
          categoriaId: catObj ? catObj.id : null,
        });
        await this.productoRepository.save(prod);
      }
      console.log('✅ Standardized 60 CENDAS products database initialized!');
    }
  }

  async getProducts() {
    return this.productoRepository.find({ relations: ['categoria'] });
  }

  async getProductById(id: number) {
    return this.productoRepository.findOne({ where: { id }, relations: ['categoria'] });
  }

  async calculateFinancialDiagnostics(dto: EvaluateBudgetDto): Promise<EvaluacionResultado> {
    const { ingresoMensualNeto, porcentajeAhorroPrevio, comprasCanasta, gastosFijos, perfilAnonimoId } = dto;

    // 1. Obtener la metadata de los productos
    const ids = comprasCanasta.map(c => c.productoId);
    let productosMetadata: Producto[] = [];
    if (ids.length > 0) {
      productosMetadata = await this.productoRepository.findByIds(ids);
    }

    // 2. Calcular costo real de canasta alimentaria básica
    let costoCanastaAlimentaria = 0;
    const comprasProcesadas = [];

    for (const compra of comprasCanasta) {
      const meta = productosMetadata.find(p => p.id === compra.productoId);
      const totalItem = Number(compra.cantidad) * Number(compra.precioUnitario);
      
      // Sumar al total si el producto pertenece a la categoría Alimentación
      if (meta && meta.categoriaId) {
        const cat = await this.categoryRepository.findOne({ where: { id: meta.categoriaId } });
        if (cat && cat.nombre === 'Alimentación') {
          costoCanastaAlimentaria += totalItem;
        }
      }

      comprasProcesadas.push({
        ...compra,
        meta,
        totalItem
      });
    }

    // 3. Fórmula CEPAL: (Costo Canasta Alimentaria Real / Ingreso Mensual Neto) * 100
    let indiceVulnerabilidadCepal = 0;
    let clasificacionCepal: 'Bienestar' | 'Vulnerabilidad' | 'Pobreza' = 'Pobreza';

    if (ingresoMensualNeto > 0) {
      indiceVulnerabilidadCepal = (costoCanastaAlimentaria / ingresoMensualNeto) * 100;
    } else {
      indiceVulnerabilidadCepal = 100;
    }

    if (indiceVulnerabilidadCepal < 35) {
      clasificacionCepal = 'Bienestar';
    } else if (indiceVulnerabilidadCepal >= 35 && indiceVulnerabilidadCepal <= 50) {
      clasificacionCepal = 'Vulnerabilidad';
    } else {
      clasificacionCepal = 'Pobreza';
    }

    // 4. Restricción de Ahorro Previo Obligatorio
    const ahorroObligatorioDescontado = ingresoMensualNeto * (porcentajeAhorroPrevio / 100);
    const presupuestoDisponiblePostAhorro = ingresoMensualNeto - ahorroObligatorioDescontado;

    // 5. Totalizar gastos fijos y comprometidos
    const totalGastosFijos = gastosFijos.reduce((sum, g) => sum + Number(g.monto), 0);
    const totalGastosComprometidos = totalGastosFijos + costoCanastaAlimentaria;

    // 6. Semáforo Financiero y Mensajes Dinámicos
    let estadoSemaforo: 'Verde' | 'Amarillo' | 'Rojo';
    let explicacionSemaforo = '';

    if (totalGastosComprometidos > ingresoMensualNeto) {
      estadoSemaforo = 'Rojo';
      const deficit = totalGastosComprometidos - ingresoMensualNeto;
      explicacionSemaforo = `Alerta Crítica: Tu presupuesto está en números rojos con un déficit de $${deficit.toFixed(2)}. Tu nivel de ingresos actual es insuficiente para cubrir la canasta básica normativa bajo los precios del mercado actual.`;
    } else if (totalGastosComprometidos > presupuestoDisponiblePostAhorro) {
      estadoSemaforo = 'Amarillo';
      const ahorroSugerido = Math.max(0, Math.round((1 - (totalGastosComprometidos / (ingresoMensualNeto || 1))) * 100));
      explicacionSemaforo = `Advertencia: Inflación en mercado detectada. Tu meta de ahorro del ${porcentajeAhorroPrevio}% ha bajado automáticamente al ${ahorroSugerido}% para poder cubrir tus necesidades primarias este mes. Se sugiere recortar la categoría de Ocio.`;
    } else {
      estadoSemaforo = 'Verde';
      const excedente = ingresoMensualNeto - totalGastosComprometidos - ahorroObligatorioDescontado;
      explicacionSemaforo = `¡Felicidades! Tu estructura financiera es sostenible. Tienes un excedente de $${excedente.toFixed(2)} que puedes destinar a inversión o fondos de emergencia corporativos.`;
    }

    // 7. Algoritmo de Sustitución Microeconómica por Inflación (Margen > 15% vs CENDAS)
    const sustitucionesSugeridas = [];
    const MARGEN_INFLACION_UMBRAL = 15.0; // 15%

    for (const item of comprasProcesadas) {
      if (!item.meta) continue;

      const precioReferencia = Number(item.meta.precio_referencia_cendas);
      const inflacionCalculada = ((Number(item.precioUnitario) - precioReferencia) / precioReferencia) * 100;

      // Si supera el umbral, buscar alternativa en la misma categoría nutricional con menor precio
      if (inflacionCalculada > MARGEN_INFLACION_UMBRAL) {
        const sustituto = await this.productoRepository
          .createQueryBuilder('p')
          .where('p.grupo_nutricional = :grupo', { grupo: item.meta.grupo_nutricional })
          .andWhere('p.id != :id', { id: item.meta.id })
          .andWhere('p.precio_referencia_cendas < :precioRef', { precioRef: precioReferencia })
          .orderBy('p.precio_referencia_cendas', 'ASC')
          .getOne();

        if (sustituto) {
          const ahorroEstimadoPorUnidad = Number(item.precioUnitario) - Number(sustituto.precio_referencia_cendas);
          sustitucionesSugeridas.push({
            productoOriginal: item.meta.nombre,
            grupoNutricional: item.meta.grupo_nutricional,
            precioPagado: Number(item.precioUnitario),
            precioCendasReferencia: precioReferencia,
            inflacionRegistrada: Math.round(inflacionCalculada * 100) / 100,
            productoSustitutoSugerido: sustituto.nombre,
            precioSustitutoReferencia: Number(sustituto.precio_referencia_cendas),
            ahorroEstimadoPorUnidad: Math.round(ahorroEstimadoPorUnidad * 100) / 100,
          });
        }
      }
    }

    // 8. IELE: Días de trabajo necesarios exclusivamente para cubrir la alimentación
    // Asumiendo un mes laboral estándar de 22 días
    const ieleDias = (costoCanastaAlimentaria / (ingresoMensualNeto || 1)) * 22;

    // 9. Inyección de variables calculadas en plantillas
    const vars = {
      consumo: Math.round(indiceVulnerabilidadCepal * 100) / 100,
      ahorro: porcentajeAhorroPrevio,
      pasivos: Math.round((totalGastosFijos / ingresoMensualNeto) * 100 * 100) / 100 || 0,
      disponible: Math.round(presupuestoDisponiblePostAhorro * 100) / 100,
      iele: Math.round(ieleDias * 10) / 10,
    };

    const reporteGenerativo = this.generarPlantillaReporte(clasificacionCepal, vars);

    // 10. Guardado de registros de forma 100% anónima para Big Data académico (Si se proporciona un ID)
    if (perfilAnonimoId) {
      try {
        const perfil = await this.perfilRepository.findOne({ where: { id: perfilAnonimoId } });
        if (perfil) {
          perfil.ingreso_mensual_neto = ingresoMensualNeto;
          await this.perfilRepository.save(perfil);

          for (const item of comprasProcesadas) {
            if (!item.meta) continue;
            const inflacion = ((Number(item.precioUnitario) - Number(item.meta.precio_referencia_cendas)) / Number(item.meta.precio_referencia_cendas)) * 100;
            const logConsumo = this.consumoRepository.create({
              perfilAnonimoId,
              productoId: item.productoId,
              cantidad: item.cantidad,
              precio_unitario_pagado: item.precioUnitario,
              inflacion_calculada: inflacion,
              fecha: new Date().toISOString().split('T')[0],
            });
            await this.consumoRepository.save(logConsumo);
          }

          const periodo = new Date().toISOString().substring(0, 7) + '-01';
          let evaluacion = await this.evaluacionRepository.findOne({ where: { perfilAnonimoId, periodo } });
          if (!evaluacion) {
            evaluacion = this.evaluacionRepository.create({ perfilAnonimoId, periodo });
          }
          evaluacion.costo_alimentario_total = costoCanastaAlimentaria;
          evaluacion.porcentaje_ahorro_previo = porcentajeAhorroPrevio;
          evaluacion.indice_vulnerabilidad_cepal = indiceVulnerabilidadCepal;
          evaluacion.clasificacion_cepal = clasificacionCepal;
          evaluacion.estado_semaforo = estadoSemaforo;
          await this.evaluacionRepository.save(evaluacion);
        }
      } catch (err) {
        console.error('Error logging anonymous academic data:', err);
      }
    }

    return {
      costoCanastaAlimentaria: Math.round(costoCanastaAlimentaria * 100) / 100,
      indiceVulnerabilidadCepal: Math.round(indiceVulnerabilidadCepal * 100) / 100,
      clasificacionCepal,
      ahorroObligatorioDescontado: Math.round(ahorroObligatorioDescontado * 100) / 100,
      presupuestoDisponibleRestante: Math.round((presupuestoDisponiblePostAhorro - totalGastosComprometidos) * 100) / 100,
      totalGastosComprometidos: Math.round(totalGastosComprometidos * 100) / 100,
      estadoSemaforo,
      explicacionSemaforo,
      sustitucionesSugeridas,
      reporteGenerativo,
      indiceEsfuerzoLaboral: Math.round(ieleDias * 10) / 10,
    };
  }

  private generarPlantillaReporte(
    clasificacion: 'Bienestar' | 'Vulnerabilidad' | 'Pobreza',
    vars: { consumo: number; ahorro: number; pasivos: number; disponible: number; iele: number },
  ): string {
    const consumoText = `Tu canasta alimentaria personalizada representa el ${vars.consumo}% de tus ingresos totales. Según los estándares de la CEPAL, un gasto alimentario ${vars.consumo > 40 ? 'superior al 40% sitúa al hogar en una condición de alta vulnerabilidad económica.' : 'inferior al 40% sitúa al hogar en una condición de bienestar económico.'}`;
    const pasivosText = `Tus compromisos fijos (Deudas y Matrícula) consumen el ${vars.pasivos}% de tu flujo de caja, lo que reduce tu margen de maniobra ante imprevistos de Salud o Emergencias.`;
    
    const libertadFinanciera = (vars.disponible - vars.pasivos) > 0 ? 'positivo' : 'negativo';
    const estrategiaText = `Para el mes en curso, tu índice de libertad financiera es ${libertadFinanciera}. Se recomienda la optimización de compras mediante marcas genéricas detectadas en el sistema de monitoreo en línea.`;
    
    const margenText = clasificacion === 'Bienestar' ? 'amplio' : 'ajustado';
    const extraText = `Hola. Actualmente estás destinando el ${vars.consumo}% de tus ingresos exclusivamente a la alimentación. Según los estándares de la CEPAL, tu presupuesto se encuentra en la clasificacion de ${clasificacion}. Tu margen para imprevistos es ${margenText}. El sistema detectó que si reduces el consumo de Carne de res de primera (Bisteck) en tu lista y buscas marcas genéricas, podrías liberar un 5% de tu sueldo para el fondo de Ahorro. Además, necesitas trabajar ${vars.iele} días al mes exclusivamente para cubrir tu alimentación.`;

    switch (clasificacion) {
      case 'Bienestar':
        return `Reporte de Diagnóstico Financiero Personal\n\n- Conclusión de Consumo: ${consumoText}\n- Conclusión de Pasivos: ${pasivosText}\n- Conclusión Estratégica: ${estrategiaText}\n\n${extraText}`;
      
      case 'Vulnerabilidad':
        return `Reporte de Diagnóstico Financiero Personal\n\n- Conclusión de Consumo: ${consumoText}\n- Conclusión de Pasivos: ${pasivosText}\n- Conclusión Estratégica: ${estrategiaText}\n\n${extraText}`;
      
      case 'Pobreza':
      default:
        return `Reporte de Diagnóstico Financiero Personal\n\n- Conclusión de Consumo: ${consumoText}\n- Conclusión de Pasivos: ${pasivosText}\n- Conclusión Estratégica: ${estrategiaText}\n\n${extraText}`;
    }
  }

  async createProfile(data: Partial<PerfilAnonimo>): Promise<PerfilAnonimo> {
    const profile = this.perfilRepository.create(data);
    return this.perfilRepository.save(profile);
  }
}
