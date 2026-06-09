export class FixedExpenseDto {
  monto: number;
  categoriaId?: number;
  nombrePersonalizado?: string;
}

export class ProductPurchaseDto {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export class EvaluateBudgetDto {
  perfilAnonimoId: string;
  ingresoMensualNeto: number;
  porcentajeAhorroPrevio: number;
  gastosFijos: FixedExpenseDto[];
  comprasCanasta: ProductPurchaseDto[];
}
