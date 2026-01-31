export interface User {
    id: string;
    email: string;
    nombre: string;
    moneda_principal: string;
    created_at: string;
    updated_at: string;
}

export interface Account {
    id: number;
    nombre: string;
    tipo: string;
    saldo_actual: number;
    activa: boolean;
    moneda: string;
    userId: string;
}

export interface Category {
    id: number;
    nombre: string;
    tipo: string;
    color: string;
    icono: string;
    userId: string;
    is_default: boolean;
}

export interface Transaction {
    id: number;
    monto: number;
    tipo: 'ingreso' | 'gasto' | 'transferencia';
    descripcion: string;
    fecha: string;
    cuentaId: number;
    categoriaId?: number;
    cuentaDestinoId?: number;
    recurrente: boolean;
}

export interface Budget {
    id: number;
    nombre: string;
    monto_maximo: number;
    periodo: string;
    categoriaId: number;
    alertas_activas?: boolean;
}

export interface Goal {
    id: number;
    nombre: string;
    monto_objetivo: number;
    monto_actual: number;
    fecha_limite: string;
    color: string;
    icono: string;
}

export interface RecurringTransaction {
    id: number;
    monto: number;
    tipo: string;
    descripcion: string;
    frecuencia: string;
    fecha_inicio: string;
    ultima_ejecucion?: string;
    cuentaId: number;
    categoriaId?: number;
    active: boolean;
}

export interface Reminder {
    id: number;
    titulo: string;
    descripcion: string;
    fecha_recordatorio: string;
    monto_estimado?: number;
    repeticion?: string;
    notificar: boolean;
    is_read: boolean;
    userId: string;
}
