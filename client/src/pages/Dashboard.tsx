import { useDecisionSupport } from '../context/DecisionSupportContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { SemaforoWidget } from '../components/decision-support/SemaforoWidget';
import { CepalMetricsCard } from '../components/decision-support/CepalMetricsCard';
import { BudgetCategoryList } from '../components/decision-support/BudgetCategoryList';
import { BookOpen } from 'lucide-react';

export default function Dashboard() {
  const { result, gastosFijos, comprasCanasta, ingresoNeto } = useDecisionSupport();

  const getCategoryDataList = () => {
    const defaultMapping: Record<number, string> = {
      1: 'Alimentación',
      2: 'Vivienda y Servicios Públicos',
      3: 'Salud',
      4: 'Educación',
      5: 'Vestido y Calzado',
      6: 'Artículos de Higiene Personal y Limpieza del Hogar',
      7: 'Transporte'
    };

    const records: Record<string, { id: number, nombre: string, monto: number, esEstatica: boolean }> = {
      'Alimentación': { id: 1, nombre: 'Alimentación', monto: result?.costoCanastaAlimentaria || 0, esEstatica: true },
      'Vivienda y Servicios Públicos': { id: 2, nombre: 'Vivienda y Servicios Públicos', monto: 0, esEstatica: true },
      'Salud': { id: 3, nombre: 'Salud', monto: 0, esEstatica: true },
      'Educación': { id: 4, nombre: 'Educación', monto: 0, esEstatica: true },
      'Vestido y Calzado': { id: 5, nombre: 'Vestido y Calzado', monto: 0, esEstatica: true },
      'Artículos de Higiene Personal y Limpieza del Hogar': { id: 6, nombre: 'Artículos de Higiene Personal y Limpieza del Hogar', monto: 0, esEstatica: true },
      'Transporte': { id: 7, nombre: 'Transporte', monto: 0, esEstatica: true }
    };

    if (!result) {
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

  const categories = getCategoryDataList();
  
  // Format data for Donut Chart
  const chartData = categories
    .filter(c => c.monto > 0)
    .map(c => ({
      name: c.nombre,
      value: c.monto,
      esEstatica: c.esEstatica
    }));

  const COLORS = {
    'Alimentación': '#e74c3c',
    'Vivienda y Servicios Públicos': '#3498db',
    'Salud': '#2ecc71',
    'Educación': '#9b59b6',
    'Vestido y Calzado': '#e67e22',
    'Artículos de Higiene Personal y Limpieza del Hogar': '#1abc9c',
    'Transporte': '#f1c40f',
  };

  const getCellColor = (name: string, index: number) => {
    return COLORS[name as keyof typeof COLORS] || `hsl(${(index * 45) % 360}, 65%, 60%)`;
  };

  const fmt = (n: number) => '$' + Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtShort = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toFixed(0);

  return (
    <div className="page active space-y-6">
      
      {/* Welcome bar */}
      <div className="welcome">
        <div className="welcome-text">
          <h2>Resumen Financiero 👋</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Visualización general del estado financiero basado en metodologías CEPAL y CENDAS
          </p>
        </div>
        <div className="welcome-badges">
          <div className="wb">
            <div className="wb-val">${fmtShort(ingresoNeto)}</div>
            <div className="wb-lbl">Ingresos IMN</div>
          </div>
          <div className="wb">
            <div className="wb-val animate-pulse" style={{ color: 'var(--red)' }}>
              ${fmtShort(result?.costoCanastaAlimentaria || 0)}
            </div>
            <div className="wb-lbl">Alimentos</div>
          </div>
          <div className="wb">
            <div className="wb-val" style={{ color: 'var(--purple)' }}>
              ${fmtShort(result?.ahorroObligatorioDescontado || 0)}
            </div>
            <div className="wb-lbl">Ahorro Previo</div>
          </div>
        </div>
      </div>

      {result ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Diagnostics (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Semaphore Widget */}
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

          </div>

          {/* Right Column: Donut Chart & Category breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="card">
              <div className="card-header">
                <span className="card-title flex items-center gap-1.5">
                  <BookOpen size={16} className="text-[var(--purple)]" />
                  Distribución del Presupuesto
                </span>
              </div>
              <div className="card-body flex flex-col items-center">
                {chartData.length > 0 ? (
                  <>
                    <div style={{ width: '100%', height: '170px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={chartData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={40} 
                            outerRadius={70} 
                            paddingAngle={3} 
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={getCellColor(entry.name, index)} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255,255,255,0.9)', 
                              borderRadius: '12px', 
                              border: '1px solid var(--glass-border)',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }} 
                            formatter={(value: number) => fmt(value)} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="w-full mt-4">
                      <BudgetCategoryList categorias={categories} />
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-400 py-8 text-xs font-semibold">
                    No hay gastos o consumos registrados para mostrar la distribución.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="card py-12 text-center text-slate-500">
          <p className="text-xs font-bold text-[var(--ink)]">Cargando diagnósticos financieros...</p>
        </div>
      )}

    </div>
  );
}
