import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, AlertTriangle, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { SemaforoWidget } from '../components/decision-support/SemaforoWidget';
import { CepalMetricsCard } from '../components/decision-support/CepalMetricsCard';
import { BudgetCategoryList } from '../components/decision-support/BudgetCategoryList';
import { SavingsPrioritizer } from '../components/decision-support/SavingsPrioritizer';
import { SubstitutionPanel } from '../components/decision-support/SubstitutionPanel';
import { GenerativeReport } from '../components/decision-support/GenerativeReport';

interface Product {
  id: number;
  nombre: string;
  unidad_medida: string;
  precio_referencia_cendas: number;
  grupo_nutricional: string;
  categoriaId: number;
}

interface FixedExpense {
  nombre: string;
  monto: number;
  categoriaId?: number;
  esEstatica: boolean;
}

interface ProductPurchase {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface DiagnosticResult {
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

export default function Planning() {
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [calculating, setCalculating] = useState(false);
  
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  
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
  const [nuevoGastoNombre, setNuevoGastoNombre] = useState('');
  const [nuevoGastoMonto, setNuevoGastoMonto] = useState('');

  const [comprasCanasta, setComprasCanasta] = useState<ProductPurchase[]>([
    { productoId: 1, nombre: 'Harina de maíz precocida', cantidad: 8, precioUnitario: 1.20 },
    { productoId: 2, nombre: 'Carne de res de primera (Bisteck)', cantidad: 6, precioUnitario: 10.50 },
    { productoId: 6, nombre: 'Queso blanco duro (Llanero)', cantidad: 4, precioUnitario: 7.00 },
    { productoId: 5, nombre: 'Leche líquida pasteurizada', cantidad: 15, precioUnitario: 1.45 },
  ]);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [purchaseQty, setPurchaseQty] = useState<string>('1');
  const [purchasePrice, setPurchasePrice] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  const [result, setResult] = useState<DiagnosticResult | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    Promise.all([
      fetch('/api/decision-support/products').then(res => res.ok ? res.json() : Promise.reject()),
      fetch('/api/categories', { headers }).then(res => res.ok ? res.json() : Promise.reject())
    ]).then(([prods]) => {
      if (Array.isArray(prods) && prods.length > 0) {
        setProducts(prods);
        setSelectedProductId(String(prods[0].id));
        setPurchasePrice(String(prods[0].precio_referencia_cendas));

        const findProd = (name: string) => prods.find(p => p.nombre.toLowerCase().includes(name.toLowerCase()));
        const defaultBasket = [];
        const harina = findProd('harina de maíz precocida');
        if (harina) defaultBasket.push({ productoId: harina.id, nombre: harina.nombre, cantidad: 8, precioUnitario: 1.20 });
        const carne = findProd('carne de res de primera');
        if (carne) defaultBasket.push({ productoId: carne.id, nombre: carne.nombre, cantidad: 6, precioUnitario: 10.50 });
        const queso = findProd('queso blanco duro');
        if (queso) defaultBasket.push({ productoId: queso.id, nombre: queso.nombre, cantidad: 4, precioUnitario: 7.00 });
        const leche = findProd('leche líquida pasteurizada');
        if (leche) defaultBasket.push({ productoId: leche.id, nombre: leche.nombre, cantidad: 15, precioUnitario: 1.45 });

        if (defaultBasket.length > 0) {
          setComprasCanasta(defaultBasket);
        }
      } else {
        setSelectedProductId(String(FALLBACK_PRODUCTS[0].id));
        setPurchasePrice(String(FALLBACK_PRODUCTS[0].precio_referencia_cendas));
      }
      setLoadingProducts(false);
    }).catch(err => {
      console.warn('Backend connection failed, running in sandbox mode.', err);
      setProducts(FALLBACK_PRODUCTS);
      setSelectedProductId(String(FALLBACK_PRODUCTS[0].id));
      setPurchasePrice(String(FALLBACK_PRODUCTS[0].precio_referencia_cendas));

      const findProd = (name: string) => FALLBACK_PRODUCTS.find(p => p.nombre.toLowerCase().includes(name.toLowerCase()));
      const defaultBasket = [];
      const harina = findProd('harina de maíz');
      if (harina) defaultBasket.push({ productoId: harina.id, nombre: harina.nombre, cantidad: 8, precioUnitario: 1.20 });
      const carne = findProd('carne de res');
      if (carne) defaultBasket.push({ productoId: carne.id, nombre: carne.nombre, cantidad: 6, precioUnitario: 10.50 });
      const queso = findProd('queso blanco duro');
      if (queso) defaultBasket.push({ productoId: queso.id, nombre: queso.nombre, cantidad: 4, precioUnitario: 7.00 });
      const leche = findProd('leche líquida');
      if (leche) defaultBasket.push({ productoId: leche.id, nombre: leche.nombre, cantidad: 15, precioUnitario: 1.45 });

      if (defaultBasket.length > 0) {
        setComprasCanasta(defaultBasket);
      }
      setLoadingProducts(false);
    });
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      const prod = products.find(p => p.id === Number(selectedProductId));
      if (prod) {
        setPurchasePrice(String(prod.precio_referencia_cendas));
      }
    }
  }, [selectedProductId, products]);

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
    if (committedTotal > disponible) {
      estadoSemaforo = 'Rojo';
      explicacionSemaforo = 'Déficit Estructural: Los gastos fijos y la alimentación básica exceden el presupuesto neto posterior al ahorro obligatorio.';
    } else if (committedTotal > disponible * 0.70) {
      estadoSemaforo = 'Amarillo';
      explicacionSemaforo = 'Capacidad Comprometida: La alimentación y gastos fijos absorben más del 70% del disponible, limitando tu margen de maniobra.';
    } else {
      estadoSemaforo = 'Verde';
      explicacionSemaforo = 'Superávit Saludable: Mantienes cubiertos tus gastos de alimentación, fijos y ahorro obligatorio con holgura para imprevistos.';
    }

    const sustitucionesSugeridas: any[] = [];
    for (const item of comprasProcesadas) {
      if (!item.meta) continue;
      const ref = item.meta.precio_referencia_cendas;
      const inflacion = ((item.precioUnitario - ref) / ref) * 100;
      if (inflacion > 0) {
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
      reporteGenerativo: reportText
    });
  };

  useEffect(() => {
    if (!loadingProducts) {
      handleEvaluate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingProducts]);

  const addFixedExpense = () => {
    if (!nuevoGastoNombre || !nuevoGastoMonto) return;
    const expense: FixedExpense = {
      nombre: nuevoGastoNombre,
      monto: Number(nuevoGastoMonto),
      esEstatica: false
    };
    setGastosFijos([...gastosFijos, expense]);
    setNuevoGastoNombre('');
    setNuevoGastoMonto('');
  };

  const removeFixedExpense = (index: number) => {
    setGastosFijos(gastosFijos.filter((_, idx) => idx !== index));
  };

  const addToBasket = () => {
    if (!selectedProductId || !purchaseQty || !purchasePrice) return;
    const prod = products.find(p => p.id === Number(selectedProductId));
    if (!prod) return;

    const exists = comprasCanasta.find(c => c.productoId === prod.id);
    if (exists) {
      setComprasCanasta(comprasCanasta.map(c => c.productoId === prod.id ? {
        ...c,
        cantidad: c.cantidad + Number(purchaseQty),
        precioUnitario: Number(purchasePrice)
      } : c));
    } else {
      setComprasCanasta([...comprasCanasta, {
        productoId: prod.id,
        nombre: prod.nombre,
        cantidad: Number(purchaseQty),
        precioUnitario: Number(purchasePrice)
      }]);
    }
    setPurchaseQty('1');
  };

  const removeFromBasket = (productId: number) => {
    setComprasCanasta(comprasCanasta.filter(c => c.productoId !== productId));
  };

  const getCategoryDataList = () => {
    const defaultMapping: Record<number, string> = {
      1: 'Alimentación',
      2: 'Vivienda',
      3: 'Salud',
      4: 'Educación',
      5: 'Vestido/Calzado',
      6: 'Higiene/Limpieza',
      7: 'Transporte'
    };

    const records: Record<string, { id: number, nombre: string, monto: number, esEstatica: boolean }> = {};

    Object.keys(defaultMapping).forEach(key => {
      const name = defaultMapping[Number(key)];
      records[name] = { id: Number(key), nombre: name, monto: 0, esEstatica: true };
    });

    if (result) {
      records['Alimentación'].monto = result.costoCanastaAlimentaria;
    } else {
      records['Alimentación'].monto = comprasCanasta.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
    }

    gastosFijos.forEach((g) => {
      if (g.esEstatica && g.categoriaId) {
        const catName = defaultMapping[g.categoriaId];
        if (catName && records[catName]) {
          records[catName].monto += g.monto;
        }
      } else {
        records[g.nombre] = { id: Math.random(), nombre: g.nombre, monto: g.monto, esEstatica: false };
      }
    });

    return Object.values(records);
  };

  const uniqueCategories = Array.from(new Set(products.map(p => p.grupo_nutricional))).sort();
  const filteredProducts = products.filter(p => {
    const matchesName = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = searchCategory ? p.grupo_nutricional === searchCategory : true;
    return matchesName && matchesCategory;
  });

  const handleSelectProduct = (prod: Product) => {
    setSelectedProductId(String(prod.id));
    setPurchasePrice(String(prod.precio_referencia_cendas));
    setPurchaseQty('1');
  };

  if (loadingProducts) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
        <RefreshCw className="animate-spin text-indigo-500" size={32} />
        <p className="text-sm font-semibold">Cargando base de datos de productos CENDAS...</p>
      </div>
    );
  }

  return (
    <div className="page active space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">
            Soporte de Decisiones Financieras
          </h1>
          <p className="text-xs text-[var(--text2)] mt-1 flex items-center gap-1.5 font-semibold">
            <BookOpen size={14} className="text-[var(--purple-soft)]" />
            Metodología CEPAL y referencias de la Canasta Básica CENDAS
          </p>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={calculating}
          className="btn btn-primary"
        >
          <RefreshCw size={14} className={calculating ? 'animate-spin' : ''} />
          {calculating ? 'Calculando...' : 'Recalcular'}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Simulation Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Income and Savings */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Sparkles size={16} className="text-[var(--purple-soft)]" />
                1. Ingreso & Ahorro Previo Obligatorio
              </span>
            </div>
            <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <label>Ingreso Mensual Neto (IMN)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={ingresoNeto === 0 ? '' : ingresoNeto}
                    onChange={(e) => setIngresoNeto(Number(e.target.value))}
                    placeholder="2500"
                    className="w-full pl-8 font-mono font-bold"
                  />
                </div>
              </div>
              
              <SavingsPrioritizer
                ingresoNeto={ingresoNeto}
                porcentajeAhorro={porcentajeAhorro}
                onChangePorcentaje={setPorcentajeAhorro}
              />
            </div>
          </div>

          {/* Section 2: Fixed Expenses */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <ShieldAlert size={16} className="text-[var(--orange)]" />
                2. Gastos Fijos Contractuales
              </span>
            </div>
            <div className="card-body space-y-4">
              {/* List current fixed expenses */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {gastosFijos.map((g, idx) => (
                  <div key={`${g.nombre}-${idx}`} className="flex justify-between items-center p-2.5 rounded-[12px] bg-white/45 border border-white/60 hover:bg-white/60 transition-all text-xs">
                    <div className="flex items-center gap-2">
                      {g.esEstatica ? (
                        <span className="badge badge-purple !px-1.5 !py-0.5 !text-[8px]">
                          CENDAS
                        </span>
                      ) : (
                        <span className="badge badge-green !px-1.5 !py-0.5 !text-[8px]">
                          Usuario
                        </span>
                      )}
                      <span className="font-bold text-[var(--ink)]">{g.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-700">${g.monto.toFixed(2)}</span>
                      {!g.esEstatica && (
                        <button
                          type="button"
                          onClick={() => removeFixedExpense(idx)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new expense */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                <div className="sm:col-span-7 field">
                  <input
                    type="text"
                    placeholder="Categoría personalizada (ej: Gimnasio, Seguros)"
                    value={nuevoGastoNombre}
                    onChange={(e) => setNuevoGastoNombre(e.target.value)}
                    className="!py-2 !text-xs"
                  />
                </div>
                <div className="sm:col-span-3 field">
                  <input
                    type="number"
                    placeholder="Monto ($)"
                    value={nuevoGastoMonto}
                    onChange={(e) => setNuevoGastoMonto(e.target.value)}
                    className="!py-2 !text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={addFixedExpense}
                    className="btn btn-ghost !w-full !py-2 flex justify-center items-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Basic Basket (Compras Canasta CENDAS) */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <AlertTriangle size={16} className="text-[var(--red)]" />
                3. Canasta Básica Alimentaria Real
              </span>
            </div>
            <div className="card-body space-y-6">
              
              {/* Buscador y Selección de Producto */}
              <div className="bg-white/45 p-4 rounded-[16px] border border-white/60 space-y-4">
                <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                  <BookOpen size={16} className="text-[var(--purple)]" />
                  Buscador de Productos CENDAS
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="field">
                    <input 
                       type="text" 
                       placeholder="Buscar producto por nombre..." 
                       value={searchQuery}
                       onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <select value={searchCategory} onChange={e => setSearchCategory(e.target.value)}>
                      <option value="">Todas las categorías</option>
                      {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Lista de productos filtrados */}
                <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredProducts.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => handleSelectProduct(p)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${selectedProductId === String(p.id) ? 'border-[var(--purple)] bg-[var(--purple)]/10' : 'border-white/60 bg-white/30 hover:bg-white/80'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[11px] text-[var(--ink)] leading-tight">{p.nombre}</p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-0.5">{p.grupo_nutricional} · {p.unidad_medida}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-[11px] text-[var(--purple)]">Ref: ${p.precio_referencia_cendas.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-xs font-semibold">
                      No se encontraron productos.
                    </div>
                  )}
                </div>

                {/* Controles de cantidad y precio (solo si hay uno seleccionado) */}
                {selectedProductId && (
                  <div className="pt-3 border-t border-white/60 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-4 field">
                      <label className="!text-[9px]">Cantidad</label>
                      <input 
                        type="number" 
                        value={purchaseQty} 
                        onChange={e => setPurchaseQty(e.target.value)} 
                        className="font-mono text-center"
                      />
                    </div>
                    <div className="md:col-span-4 field">
                      <label className="!text-[9px]">Precio Pagado ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={purchasePrice} 
                        onChange={e => setPurchasePrice(e.target.value)} 
                        className="font-mono text-center"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <button 
                        type="button"
                        onClick={addToBasket} 
                        className="btn btn-primary !w-full flex justify-center items-center gap-1 !py-2.5"
                      >
                        <Plus size={14} /> Añadir
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de productos en la canasta */}
              <div className="pt-2">
                <h3 className="font-bold text-sm text-[var(--ink)] mb-3 flex items-center justify-between">
                  Mi Canasta Real
                  <span className="badge badge-purple">{comprasCanasta.length} items</span>
                </h3>
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                  {comprasCanasta.length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-300 rounded-xl">
                      Aún no has agregado productos a tu canasta.
                    </div>
                  )}
                  {comprasCanasta.map((c) => {
                    const reference = products.find(p => p.id === c.productoId)?.precio_referencia_cendas || c.precioUnitario;
                    const priceDelta = ((c.precioUnitario - reference) / reference) * 100;
                    
                    return (
                      <div key={c.productoId} className="p-2.5 rounded-[12px] bg-white/45 border border-white/60 flex justify-between items-center text-xs hover:bg-white/60 transition-colors">
                        <div className="space-y-1">
                          <p className="font-bold text-[var(--ink)]">{c.nombre}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">
                            {c.cantidad} uds · ${c.precioUnitario.toFixed(2)} pagado (Ref: ${reference.toFixed(2)})
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-mono font-bold text-slate-700">${(c.cantidad * c.precioUnitario).toFixed(2)}</p>
                            {priceDelta > 15 && (
                              <span className="badge badge-red !px-1.5 !py-0.25 !text-[7px]">+{priceDelta.toFixed(0)}% infl.</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromBasket(c.productoId)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Diagnostics & Reports (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <>
              {/* Semaforo Widget */}
              <SemaforoWidget
                estado={result.estadoSemaforo}
                explicacion={result.explicacionSemaforo}
                presupuestoRestante={result.presupuestoDisponibleRestante}
              />

              {/* CEPAL Metrics */}
              <CepalMetricsCard
                indice={result.indiceVulnerabilidadCepal}
                clasificacion={result.clasificacionCepal}
                costoCanasta={result.costoCanastaAlimentaria}
                indiceEsfuerzoLaboral={result.indiceEsfuerzoLaboral}
              />

              {/* Generative Report */}
              <GenerativeReport reporte={result.reporteGenerativo} />

              {/* Substitution suggestions */}
              <SubstitutionPanel sugerencias={result.sustitucionesSugeridas} />

              {/* Budget Category List */}
              <div className="card">
                <div className="card-body">
                  <BudgetCategoryList categorias={getCategoryDataList()} />
                </div>
              </div>
            </>
          ) : (
            <div className="card">
              <div className="card-body text-center text-slate-500 py-12">
                <AlertTriangle className="mx-auto text-[var(--purple-soft)] mb-3" size={28} />
                <p className="text-xs font-bold text-[var(--ink)]">Esperando simulación...</p>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold">Presiona Recalcular para ver el diagnóstico CEPAL.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
