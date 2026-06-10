import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: number;
  nombre: string;
  unidad_medida: string;
  precio_referencia_cendas: number;
  grupo_nutricional: string;
  categoriaId: number;
}

export interface FixedExpense {
  nombre: string;
  monto: number;
  categoriaId?: number;
  esEstatica: boolean;
}

export interface ProductPurchase {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface DiagnosticResult {
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
  indiceEsfuerzoLaboral?: number;
}

interface DecisionSupportContextType {
  products: Product[];
  loadingProducts: boolean;
  calculating: boolean;
  ingresoNeto: number;
  setIngresoNeto: (val: number) => void;
  porcentajeAhorro: number;
  setPorcentajeAhorro: (val: number) => void;
  gastosFijos: FixedExpense[];
  setGastosFijos: (val: FixedExpense[]) => void;
  comprasCanasta: ProductPurchase[];
  setComprasCanasta: (val: ProductPurchase[]) => void;
  result: DiagnosticResult | null;
  handleEvaluate: () => Promise<void>;
  addFixedExpense: (nombre: string, monto: number) => void;
  removeFixedExpense: (index: number) => void;
  addToBasket: (productId: number, qty: number, price: number) => void;
  removeFromBasket: (productId: number) => void;
  addCustomProduct: (prod: Omit<Product, 'id'>) => void;
}

const FALLBACK_PRODUCTS: Product[] = [
  { id: 1, nombre: 'Harina de maíz precocida', unidad_medida: 'Kg', precio_referencia_cendas: 1.10, grupo_nutricional: 'Cereales y Derivados', categoriaId: 1 },
  { id: 2, nombre: 'Carne de res de primera (Bisteck)', unidad_medida: 'Kg', precio_referencia_cendas: 8.50, grupo_nutricional: 'Carnes', categoriaId: 1 },
  { id: 3, nombre: 'Pollo entero', unidad_medida: 'Kg', precio_referencia_cendas: 3.20, grupo_nutricional: 'Carnes', categoriaId: 1 },
  { id: 4, nombre: 'Huevos de gallina', unidad_medida: 'Unidades', precio_referencia_cendas: 0.15, grupo_nutricional: 'Leche, Quesos y Huevos', categoriaId: 1 },
  { id: 5, nombre: 'Leche líquida pasteurizada', unidad_medida: 'Litros', precio_referencia_cendas: 1.40, grupo_nutricional: 'Leche, Quesos y Huevos', categoriaId: 1 },
  { id: 6, nombre: 'Queso blanco duro (Llanero)', unidad_medida: 'Kg', precio_referencia_cendas: 4.80, grupo_nutricional: 'Leche, Quesos y Huevos', categoriaId: 1 },
  { id: 7, nombre: 'Aceite vegetal de cocina', unidad_medida: 'Litros', precio_referencia_cendas: 2.10, grupo_nutricional: 'Grasas y Aceites', categoriaId: 1 },
  { id: 8, nombre: 'Arroz blanco', unidad_medida: 'Kg', precio_referencia_cendas: 1.00, grupo_nutricional: 'Cereales y Derivados', categoriaId: 1 },
];

const DecisionSupportContext = createContext<DecisionSupportContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useDecisionSupport() {
  const context = useContext(DecisionSupportContext);
  if (!context) throw new Error('useDecisionSupport must be used within a DecisionSupportProvider');
  return context;
}

export function DecisionSupportProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [calculating, setCalculating] = useState(false);
  
  const [ingresoNeto, setIngresoNeto] = useState<number>(2500);
  const [porcentajeAhorro, setPorcentajeAhorro] = useState<number>(15);
  
  const [gastosFijos, setGastosFijos] = useState<FixedExpense[]>([
    { nombre: 'Alquiler / Vivienda', monto: 500, esEstatica: true, categoriaId: 2 },
    { nombre: 'Seguro Médico / Salud', monto: 120, esEstatica: true, categoriaId: 3 },
    { nombre: 'Colegiatura / Educación', monto: 150, esEstatica: true, categoriaId: 4 },
    { nombre: 'Transporte / Combustible', monto: 90, esEstatica: true, categoriaId: 7 },
    { nombre: 'Higiene y Limpieza', monto: 60, esEstatica: true, categoriaId: 6 },
    { nombre: 'Ropa / Calzado', monto: 50, esEstatica: true, categoriaId: 5 },
  ]);

  const [comprasCanasta, setComprasCanasta] = useState<ProductPurchase[]>([]);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  // Load products on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    Promise.all([
      fetch('/api/decision-support/products').then(res => res.ok ? res.json() : Promise.reject()),
      fetch('/api/categories', { headers }).then(res => res.ok ? res.json() : Promise.reject())
    ]).then(([prods]) => {
      if (Array.isArray(prods) && prods.length > 0) {
        setProducts(prods);
        
        const findProd = (name: string) => prods.find(p => p.nombre.toLowerCase().includes(name.toLowerCase()));
        const defaultBasket = [];
        const harina = findProd('harina de maíz precocida');
        if (harina) defaultBasket.push({ productoId: harina.id, nombre: harina.nombre, cantidad: 8, precioUnitario: 1.15 });
        const carne = findProd('carne de res de primera');
        if (carne) defaultBasket.push({ productoId: carne.id, nombre: carne.nombre, cantidad: 6, precioUnitario: 10.50 });
        const pollo = findProd('pollo entero');
        if (pollo) defaultBasket.push({ productoId: pollo.id, nombre: pollo.nombre, cantidad: 12, precioUnitario: 3.30 });
        const leche = findProd('leche líquida pasteurizada');
        if (leche) defaultBasket.push({ productoId: leche.id, nombre: leche.nombre, cantidad: 15, precioUnitario: 1.45 });

        if (defaultBasket.length > 0) {
          setComprasCanasta(defaultBasket);
        }
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
      setLoadingProducts(false);
    }).catch(err => {
      console.warn('Backend connection failed, running in sandbox mode.', err);
      setProducts(FALLBACK_PRODUCTS);
      
      const findProd = (name: string) => FALLBACK_PRODUCTS.find(p => p.nombre.toLowerCase().includes(name.toLowerCase()));
      const defaultBasket = [];
      const harina = findProd('harina de maíz');
      if (harina) defaultBasket.push({ productoId: harina.id, nombre: harina.nombre, cantidad: 8, precioUnitario: 1.15 });
      const carne = findProd('carne de res');
      if (carne) defaultBasket.push({ productoId: carne.id, nombre: carne.nombre, cantidad: 6, precioUnitario: 10.50 });
      const pollo = findProd('pollo entero');
      if (pollo) defaultBasket.push({ productoId: pollo.id, nombre: pollo.nombre, cantidad: 12, precioUnitario: 3.30 });
      const leche = findProd('leche líquida');
      if (leche) defaultBasket.push({ productoId: leche.id, nombre: leche.nombre, cantidad: 15, precioUnitario: 1.45 });

      if (defaultBasket.length > 0) {
        setComprasCanasta(defaultBasket);
      }
      setLoadingProducts(false);
    });
  }, []);

  const handleEvaluate = async () => {
    setCalculating(true);
    
    const payload = {
      ingresoMensualNeto: ingresoNeto,
      porcentajeAhorroPrevio: porcentajeAhorro,
      gastosFijos: gastosFijos.map(g => ({
        monto: Number(g.monto),
        categoriaId: g.categoriaId,
        nombrePersonalizado: g.esEstatica ? undefined : g.nombre
      })),
      comprasCanasta: comprasCanasta.map(c => ({
        productoId: c.productoId,
        cantidad: Number(c.cantidad),
        precioUnitario: Number(c.precioUnitario)
      }))
    };

    try {
      const res = await fetch('/api/decision-support/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        calculateFallback(payload);
      }
    } catch {
      calculateFallback(payload);
    } finally {
      setCalculating(false);
    }
  };

  const calculateFallback = (payload: any) => {
    const { ingresoMensualNeto, porcentajeAhorroPrevio, comprasCanasta, gastosFijos } = payload;
    
    let costoCanastaAlimentaria = 0;
    const comprasProcesadas = [];
    
    for (const c of comprasCanasta) {
      const meta = products.find(p => p.id === c.productoId);
      const totalItem = c.cantidad * c.precioUnitario;
      costoCanastaAlimentaria += totalItem;
      comprasProcesadas.push({ ...c, meta });
    }

    const indiceVulnerabilidadCepal = ingresoMensualNeto > 0 ? (costoCanastaAlimentaria / ingresoMensualNeto) * 100 : 100;
    let clasificacionCepal: 'Bienestar' | 'Vulnerabilidad' | 'Pobreza' = 'Pobreza';
    if (indiceVulnerabilidadCepal < 35) clasificacionCepal = 'Bienestar';
    else if (indiceVulnerabilidadCepal <= 50) clasificacionCepal = 'Vulnerabilidad';

    const ahorroObligatorioDescontado = ingresoMensualNeto * (porcentajeAhorroPrevio / 100);
    const disponible = ingresoMensualNeto - ahorroObligatorioDescontado;

    const totalFixed = gastosFijos.reduce((sum: number, g: any) => sum + g.monto, 0);
    const committedTotal = totalFixed + costoCanastaAlimentaria;

    let estadoSemaforo: 'Verde' | 'Amarillo' | 'Rojo';
    let explicacionSemaforo = '';
    if (committedTotal > ingresoMensualNeto) {
      estadoSemaforo = 'Rojo';
      explicacionSemaforo = `Alerta Crítica: Tu presupuesto está en números rojos con un déficit de $${(committedTotal - ingresoMensualNeto).toFixed(2)}. Tu nivel de ingresos actual es insuficiente para cubrir la canasta básica normativa bajo los precios del mercado actual.`;
    } else if (committedTotal > disponible) {
      estadoSemaforo = 'Amarillo';
      const ahorroSugerido = Math.max(0, Math.round((1 - (committedTotal / (ingresoMensualNeto || 1))) * 100));
      explicacionSemaforo = `Advertencia: Inflación en mercado detectada. Tu meta de ahorro del ${porcentajeAhorroPrevio}% ha bajado automáticamente al ${ahorroSugerido}% para poder cubrir tus necesidades primarias este mes. Se sugiere recortar la categoría de Ocio.`;
    } else {
      estadoSemaforo = 'Verde';
      const excedente = disponible - committedTotal;
      explicacionSemaforo = `¡Felicidades! Tu estructura financiera es sostenible. Tienes un excedente de $${excedente.toFixed(2)} que puedes destinar a inversión o fondos de emergencia corporativos.`;
    }

    const sustitucionesSugeridas: any[] = [];
    for (const item of comprasProcesadas) {
      if (!item.meta) continue;
      const ref = item.meta.precio_referencia_cendas;
      const inflacion = ((item.precioUnitario - ref) / ref) * 100;
      if (inflacion > 15) {
        const sustituto = products.find(p => p.grupo_nutricional === item.meta.grupo_nutricional && p.id !== item.meta.id && p.precio_referencia_cendas < ref);
        if (sustituto) {
          sustitucionesSugeridas.push({
            productoOriginal: item.meta.nombre,
            grupoNutricional: item.meta.grupo_nutricional,
            precioPagado: item.precioUnitario,
            precioCendasReferencia: ref,
            inflacionRegistrada: Math.round(inflacion * 100) / 100,
            productoSustitutoSugerido: sustituto.nombre,
            precioSustitutoReferencia: sustituto.precio_referencia_cendas,
            ahorroEstimadoPorUnidad: Math.round((item.precioUnitario - sustituto.precio_referencia_cendas) * 100) / 100
          });
        }
      }
    }

    const pasivosPct = Math.round((totalFixed / ingresoMensualNeto) * 100 * 100) / 100 || 0;
    const reportText = clasificacionCepal === 'Bienestar'
      ? `El hogar presenta un estado de Bienestar según estándares metodológicos de la CEPAL. Con un consumo alimentario básico que representa solo el ${indiceVulnerabilidadCepal.toFixed(1)}% del ingreso mensual neto, el presupuesto familiar cuenta con holgura. Se sugiere consolidar la estrategia de ahorro obligatorio del ${porcentajeAhorro}% orientándolo hacia instrumentos financieros indexados. Los pasivos fijos consumen un ${pasivosPct}% de los ingresos, lo cual denota un control de deuda saludable y un flujo neto mensual remanente óptimo.`
      : clasificacionCepal === 'Vulnerabilidad'
      ? `Se detecta un nivel de Vulnerabilidad Financiera y Nutricional. La canasta alimentaria absorbe el ${indiceVulnerabilidadCepal.toFixed(1)}% del ingreso mensual neto, comprometiendo la elasticidad presupuestaria. Se recomienda activar el protocolo de sustitución de proteínas hacia rubros avícolas/huevos para optimizar la compra y resguardar el ahorro obligatorio fijado en ${porcentajeAhorro}%. El nivel de pasivos fijos es de ${pasivosPct}%.`
      : `Estado de Pobreza Estructural basado en la medición directa de la Canasta Básica Alimentaria. La alimentación familiar exige el ${indiceVulnerabilidadCepal.toFixed(1)}% del ingreso mensual neto, lo cual significa que se requiere más del 50% de la fuerza de ingreso para cubrir necesidades básicas. El ahorro del ${porcentajeAhorro}% genera un déficit del flujo de caja efectivo con pasivos fijos que absorben el ${pasivosPct}%.`;

    const ieleDias = (costoCanastaAlimentaria / (ingresoMensualNeto || 1)) * 22;

    setResult({
      costoCanastaAlimentaria: Math.round(costoCanastaAlimentaria * 100) / 100,
      indiceVulnerabilidadCepal: Math.round(indiceVulnerabilidadCepal * 100) / 100,
      clasificacionCepal,
      ahorroObligatorioDescontado: Math.round(ahorroObligatorioDescontado * 100) / 100,
      presupuestoDisponibleRestante: Math.round((disponible - committedTotal) * 100) / 100,
      totalGastosComprometidos: Math.round(committedTotal * 100) / 100,
      estadoSemaforo,
      explicacionSemaforo,
      sustitucionesSugeridas,
      reporteGenerativo: reportText,
      indiceEsfuerzoLaboral: Math.round(ieleDias * 10) / 10,
    });
  };

  // Evaluate whenever inputs change
  useEffect(() => {
    if (!loadingProducts) {
      handleEvaluate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingProducts, ingresoNeto, porcentajeAhorro, gastosFijos, comprasCanasta]);

  const addFixedExpense = (nombre: string, monto: number) => {
    const expense: FixedExpense = {
      nombre,
      monto,
      esEstatica: false
    };
    setGastosFijos(prev => [...prev, expense]);
  };

  const removeFixedExpense = (index: number) => {
    setGastosFijos(prev => prev.filter((_, idx) => idx !== index));
  };

  const addToBasket = (productId: number, qty: number, price: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setComprasCanasta(prev => {
      const exists = prev.find(c => c.productoId === productId);
      if (exists) {
        return prev.map(c => c.productoId === productId ? {
          ...c,
          cantidad: c.cantidad + qty,
          precioUnitario: price
        } : c);
      } else {
        return [...prev, {
          productoId: productId,
          nombre: prod.nombre,
          cantidad: qty,
          precioUnitario: price
        }];
      }
    });
  };

  const removeFromBasket = (productId: number) => {
    setComprasCanasta(prev => prev.filter(c => c.productoId !== productId));
  };

  const addCustomProduct = (prod: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...prod,
      id: Date.now()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  return (
    <DecisionSupportContext.Provider value={{
      products,
      loadingProducts,
      calculating,
      ingresoNeto,
      setIngresoNeto,
      porcentajeAhorro,
      setPorcentajeAhorro,
      gastosFijos,
      setGastosFijos,
      comprasCanasta,
      setComprasCanasta,
      result,
      handleEvaluate,
      addFixedExpense,
      removeFixedExpense,
      addToBasket,
      removeFromBasket,
      addCustomProduct,
    }}>
      {children}
    </DecisionSupportContext.Provider>
  );
}
