import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, X, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savings: number;
}

interface Transaction {
    id: number;
    monto: number;
    tipo: 'ingreso' | 'gasto' | 'transferencia';
    descripcion: string;
    fecha: string;
    categoria?: { nombre: string; icono?: string; color?: string };
    cuenta?: { nombre: string };
}

interface Meta {
    id: number;
    nombre: string;
    objetivo: number;
    actual: number;
    color: string;
    descripcion: string;
}

interface DashboardProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const COLORS = ['#c9922a', '#2d6a4f', '#c1440e', '#2c5f8a', '#52b788', '#9b968e', '#4a4540'];

// Semilla de datos
const getSeedTransactions = (): Transaction[] => {
  const now = new Date();
  return [
    { id: 101, monto: 3500, tipo: 'ingreso', descripcion: 'Salario Quincenal', fecha: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString(), categoria: { nombre: 'Sueldo', icono: '💰' } },
    { id: 102, monto: 120.5, tipo: 'gasto', descripcion: 'Supermercado', fecha: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3).toISOString(), categoria: { nombre: 'Alimentos', icono: '🛒' } },
    { id: 103, monto: 45, tipo: 'gasto', descripcion: 'Suscripción Streaming', fecha: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5).toISOString(), categoria: { nombre: 'Ocio', icono: '🍿' } },
    { id: 104, monto: 850, tipo: 'ingreso', descripcion: 'Trabajo Freelance', fecha: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10).toISOString(), categoria: { nombre: 'Freelance', icono: '💻' } },
    { id: 105, monto: 65, tipo: 'gasto', descripcion: 'Cena Restaurante', fecha: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12).toISOString(), categoria: { nombre: 'Comidas', icono: '🍕' } },
    
    { id: 106, monto: 3500, tipo: 'ingreso', descripcion: 'Salario Quincenal', fecha: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString(), categoria: { nombre: 'Sueldo', icono: '💰' } },
    { id: 107, monto: 300, tipo: 'gasto', descripcion: 'Factura Eléctrica', fecha: new Date(now.getFullYear(), now.getMonth() - 1, 18).toISOString(), categoria: { nombre: 'Servicios', icono: '⚡' } },
    { id: 108, monto: 50, tipo: 'gasto', descripcion: 'Gasolina', fecha: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString(), categoria: { nombre: 'Transporte', icono: '🚗' } },
    
    { id: 109, monto: 1500, tipo: 'ingreso', descripcion: 'Bono Productividad', fecha: new Date(now.getFullYear(), now.getMonth() - 2, 5).toISOString(), categoria: { nombre: 'Bono', icono: '🎊' } },
    { id: 110, monto: 450, tipo: 'gasto', descripcion: 'Seguro del Auto', fecha: new Date(now.getFullYear(), now.getMonth() - 2, 10).toISOString(), categoria: { nombre: 'Transporte', icono: '🛡️' } },
    
    { id: 111, monto: 3500, tipo: 'ingreso', descripcion: 'Salario Quincenal', fecha: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString(), categoria: { nombre: 'Sueldo', icono: '💰' } },
    { id: 112, monto: 800, tipo: 'gasto', descripcion: 'Renta', fecha: new Date(now.getFullYear(), now.getMonth() - 3, 5).toISOString(), categoria: { nombre: 'Hogar', icono: '🏠' } },
    
    { id: 113, monto: 3500, tipo: 'ingreso', descripcion: 'Salario Quincenal', fecha: new Date(now.getFullYear(), now.getMonth() - 4, 1).toISOString(), categoria: { nombre: 'Sueldo', icono: '💰' } },
    { id: 114, monto: 200, tipo: 'gasto', descripcion: 'Ropa', fecha: new Date(now.getFullYear(), now.getMonth() - 4, 15).toISOString(), categoria: { nombre: 'Compras', icono: '🛍️' } },
  ];
};

const SEED_METAS: Meta[] = [
  { id: 1, nombre: 'Fondo de Emergencia', objetivo: 10000, actual: 4119.5, color: 'var(--blue)', descripcion: '3 meses de gastos cubiertos' },
  { id: 2, nombre: 'Viaje a Japón', objetivo: 5000, actual: 1200, color: 'var(--gold)', descripcion: 'Vacaciones 2027' },
  { id: 3, nombre: 'Nuevo Laptop', objetivo: 2500, actual: 800, color: 'var(--green)', descripcion: 'Renovación de equipo' }
];

export default function Dashboard({ showModal, setShowModal }: DashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savings: 0
  });
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Metas state
  const [metas, setMetas] = useState<Meta[]>(SEED_METAS);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [selectedTxEmoji, setSelectedTxEmoji] = useState('💰');

  const calculateDashboardData = (transactions: Transaction[]) => {
      const sorted = [...transactions].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setAllTransactions(sorted);

      const now = new Date();
      const thisMonthTxs = sorted.filter(t => {
          const d = new Date(t.fecha);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      const totalIncome = thisMonthTxs.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + Number(t.monto), 0);
      const totalExpense = thisMonthTxs.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + Number(t.monto), 0);
      
      const historicalIncome = sorted.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + Number(t.monto), 0);
      const historicalExpense = sorted.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + Number(t.monto), 0);

      setStats({
          totalBalance: historicalIncome - historicalExpense,
          monthlyIncome: totalIncome,
          monthlyExpenses: totalExpense,
          savings: totalIncome - totalExpense
      });

      const cData = [];
      for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = d.toLocaleDateString('es-ES', { month: 'short' });
          const monthTxs = sorted.filter(t => {
              const td = new Date(t.fecha);
              return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
          });
          const inc = monthTxs.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + Number(t.monto), 0);
          const exp = monthTxs.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + Number(t.monto), 0);
          cData.push({ name: i === 0 ? 'Actual' : monthName, inc, exp });
      }
      setChartData(cData);

      const catMap: Record<string, number> = {};
      sorted.filter(t => t.tipo === 'gasto').forEach(t => {
          const cat = t.categoria?.nombre || 'General';
          catMap[cat] = (catMap[cat] || 0) + Number(t.monto);
      });
      const catDataArr = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] }));
      catDataArr.sort((a, b) => b.value - a.value);
      setCategoryData(catDataArr);
  };

  useEffect(() => {
    const fetchData = async () => {
        let trxs = getSeedTransactions();
        try {
            const recentRes = await fetch('http://localhost:3000/transactions');
            if (recentRes.ok) {
                const fetched = await recentRes.json();
                if (Array.isArray(fetched) && fetched.length > 0) {
                    trxs = [...trxs, ...fetched];
                }
            }
        } catch (error) {
            console.log("Using seed data directly.");
        } finally {
            calculateDashboardData(trxs);
            setLoading(false);
        }
    };

    fetchData();
  }, []);

  useEffect(() => {
        const handleExport = () => {
            if (allTransactions.length === 0) return;
            
            const headers = ['ID', 'Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'];
            const csvRows = allTransactions.map(t => {
                const fecha = t.fecha && !isNaN(new Date(t.fecha).getTime()) ? new Date(t.fecha).toLocaleDateString('es-ES') : '';
                const desc = `"${(t.descripcion || '').toString().replace(/"/g, '""')}"`;
                const cat = `"${(t.categoria?.nombre || 'General').replace(/"/g, '""')}"`;
                return [t.id, fecha, t.tipo, cat, desc, t.monto].join(',');
            });
            
            const csvContent = [headers.join(','), ...csvRows].join('\n');
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'FinFlow_Historial.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        window.addEventListener('export-excel', handleExport as EventListener);
        return () => window.removeEventListener('export-excel', handleExport as EventListener);
  }, [allTransactions]);

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tipo = formData.get('tipo') as 'ingreso' | 'gasto';
    const monto = Number(formData.get('monto'));
    
    const newTx: Transaction = {
        id: Date.now(),
        monto,
        descripcion: formData.get('descripcion') as string,
        tipo,
        fecha: new Date().toISOString(),
        categoria: { nombre: 'General', icono: selectedTxEmoji }
    };
    
    const updatedTxs = [newTx, ...allTransactions];
    calculateDashboardData(updatedTxs);
    setSelectedTxEmoji('💰');
    setShowModal(false);
    
    fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ ...newTx, cuenta_id: 1 })
    }).catch(() => {});
  };

  const handleDeleteTransaction = (id: number) => {
      const updated = allTransactions.filter(t => t.id !== id);
      calculateDashboardData(updated);
      fetch(`http://localhost:3000/transactions/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleAddMeta = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const nuevaMeta: Meta = {
          id: Date.now(),
          nombre: formData.get('nombre') as string,
          descripcion: formData.get('descripcion') as string,
          objetivo: Number(formData.get('objetivo')),
          actual: Number(formData.get('actual') || 0),
          color: COLORS[metas.length % COLORS.length] // Auto-assign color
      };
      setMetas([...metas, nuevaMeta]);
      setShowMetaModal(false);
  };

  const handleDeleteMeta = (id: number) => {
      setMetas(metas.filter(m => m.id !== id));
  };

  if (loading) return <div className="p-8 text-center text-muted font-mono">Cargando datos...</div>;

  const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: user?.moneda_principal || 'USD' }).format(n);

  const formatTxDate = (dateString: string) => {
      if (!dateString) return 'Fecha desconocida';
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Fecha inválida';
      const datePart = d.toLocaleDateString('es-ES', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
      const timePart = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      return `${datePart}, ${timePart}`;
  };

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon"><TrendingUp /></div>
          <div className="stat-label">Ingresos del mes</div>
          <div className="stat-value">{fmt(stats.monthlyIncome)}</div>
          <div className="stat-change">Total cobrado este mes</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-icon"><TrendingDown /></div>
          <div className="stat-label">Gastos del mes</div>
          <div className="stat-value">{fmt(stats.monthlyExpenses)}</div>
          <div className="stat-change">Total gastado este mes</div>
        </div>
        <div className="stat-card balance">
          <div className="stat-icon"><DollarSign /></div>
          <div className="stat-label">Balance del mes</div>
          <div className="stat-value">{fmt(stats.savings)}</div>
          <div className="stat-change">ingreso − gasto actual</div>
        </div>
        <div className="stat-card savings">
          <div className="stat-icon"><PiggyBank /></div>
          <div className="stat-label">Total en cuentas</div>
          <div className="stat-value">{fmt(stats.totalBalance)}</div>
          <div className="stat-change">balance histórico acumulado</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Ingresos vs Gastos — últimos 6 meses</span>
          </div>
          <div className="card-body">
            <div className="h-64 w-full mt-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <XAxis dataKey="name" stroke="#9b968e" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }} formatter={(value: number) => fmt(value)} />
                        <Line type="monotone" dataKey="inc" name="Ingresos" stroke="var(--green)" strokeWidth={3} dot={{r: 0}} activeDot={{r: 6, fill: 'var(--green)'}} />
                        <Line type="monotone" dataKey="exp" name="Gastos" stroke="var(--red)" strokeWidth={3} dot={{r: 0}} activeDot={{r: 6, fill: 'var(--red)'}} />
                    </LineChart>
                 </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Gastos por Categoría</span>
          </div>
          <div className="card-body flex flex-col items-center">
            <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.8rem' }} formatter={(value: number) => fmt(value)} />
                    </PieChart>
                 </ResponsiveContainer>
            </div>
            
            <div className="w-full mt-4 flex flex-col gap-2 max-h-[100px] overflow-y-auto pr-2">
               {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex justify-between items-center text-[0.75rem]">
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                        <span className="text-ink2 font-medium">{cat.name}</span>
                     </div>
                     <span className="font-mono">{fmt(cat.value)}</span>
                  </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Historial de Transacciones</span>
          </div>
          <div className="card-body p-0">
            <div className="tx-list px-6 pb-2 max-h-[400px] overflow-y-auto">
              {allTransactions.length === 0 ? (
                  <div className="empty-state">
                      <div className="empty-icon">💸</div>
                      <h3>Sin transacciones</h3>
                      <p>Agrega una para empezar</p>
                  </div>
              ) : (
                  allTransactions.map(t => (
                      <div key={t.id} className="tx-item group relative">
                          <div className="tx-icon" style={{ backgroundColor: t.tipo === 'ingreso' ? 'var(--green-light)' : 'var(--red-light)', color: t.tipo === 'ingreso' ? 'var(--green)' : 'var(--red)' }}>
                             {t.categoria?.icono || (t.tipo === 'ingreso' ? '💰' : '💳')}
                          </div>
                          <div className="tx-info flex-1">
                              <div className="tx-name">{t.descripcion}</div>
                              <div className="tx-meta">{t.categoria?.nombre || 'General'} · {formatTxDate(t.fecha)} {t.cuenta ? `· ${t.cuenta.nombre}` : ''}</div>
                          </div>
                          <div className={`tx-amount pr-8 ${t.tipo === 'ingreso' ? 'in' : 'out'}`}>
                              {t.tipo === 'ingreso' ? '+' : '-'}{fmt(Number(t.monto))}
                          </div>
                          <button 
                             onClick={() => handleDeleteTransaction(t.id)} 
                             className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red hover:bg-red-light p-2 rounded-xl transition-all"
                             title="Eliminar transacción"
                          >
                             <Trash2 size={16} />
                          </button>
                      </div>
                  ))
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Metas de Ahorro</span>
          </div>
          <div className="card-body flex flex-col gap-6">
            {metas.length === 0 ? (
                <div className="text-center text-muted text-sm py-8">No hay metas definidas. ¡Crea una para motivarte!</div>
            ) : metas.map(m => (
                <div key={m.id} className="relative group pr-10 py-1">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h4 className="text-[0.88rem] font-bold">{m.nombre}</h4>
                      <div className="text-[0.7rem] text-muted mt-0.5">{m.descripcion}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[0.85rem] font-bold text-ink">{fmt(m.actual)}</div>
                      <div className="text-[0.65rem] text-muted">de {fmt(m.objetivo)}</div>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-cream rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-1000" style={{ width: `${Math.min(100, (m.actual / m.objetivo) * 100)}%`, backgroundColor: m.color }}></div>
                  </div>
                  <button 
                     onClick={() => handleDeleteMeta(m.id)} 
                     className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red hover:bg-red-light p-2 rounded-xl transition-all"
                     title="Eliminar meta"
                  >
                     <Trash2 size={16} />
                  </button>
                </div>
            ))}

            <button onClick={() => setShowMetaModal(true)} className="btn btn-ghost w-full justify-center mt-2 text-[0.8rem] py-2 border border-dashed border-border hover:border-gold hover:text-gold transition-colors">
              + Añadir nueva meta
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Añadir Transacción */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-[fadeUp_0.2s_ease]">
          <div className="bg-card w-full max-w-md max-h-full flex flex-col rounded-[24px] shadow-lg border border-border">
            <div className="flex justify-between items-center p-6 border-b border-border shrink-0">
              <h3 className="font-serif text-xl font-bold">Nuevo Registro</h3>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleAddTransaction} className="flex flex-col gap-5">
                
                <div>
                  <label className="block text-[0.8rem] font-bold text-ink2 mb-2 uppercase tracking-wide">Tipo de movimiento</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center justify-center gap-2 p-3 border border-border rounded-xl cursor-pointer hover:bg-cream transition-colors has-[:checked]:border-green has-[:checked]:bg-green-light has-[:checked]:text-green">
                      <input type="radio" name="tipo" value="ingreso" className="hidden" defaultChecked />
                      <span className="font-medium text-sm">Ingreso</span>
                    </label>
                    <label className="flex items-center justify-center gap-2 p-3 border border-border rounded-xl cursor-pointer hover:bg-cream transition-colors has-[:checked]:border-red has-[:checked]:bg-red-light has-[:checked]:text-red">
                      <input type="radio" name="tipo" value="gasto" className="hidden" />
                      <span className="font-medium text-sm">Gasto</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[0.8rem] font-bold text-ink2 mb-2 uppercase tracking-wide">Selecciona un icono</label>
                  <div className="flex flex-wrap gap-2">
                     {['💰', '💳', '🛒', '🍕', '🚗', '🏠', '🍿', '💻', '🛍️', '⚡', '✈️', '🏥', '🎁', '🎓'].map(em => (
                        <button 
                          type="button" 
                          key={em} 
                          onClick={() => setSelectedTxEmoji(em)}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${selectedTxEmoji === em ? 'bg-gold-light border-2 border-gold scale-110 shadow-sm' : 'bg-cream border border-transparent hover:border-border hover:bg-white'}`}
                        >
                           {em}
                        </button>
                     ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[0.8rem] font-bold text-ink2 mb-2 uppercase tracking-wide">Descripción</label>
                  <input type="text" name="descripcion" required placeholder="Ej. Compra de supermercado" className="w-full bg-cream border-none p-4 rounded-xl text-[0.95rem] outline-none focus:ring-2 focus:ring-gold/50" />
                </div>

                <div>
                  <label className="block text-[0.8rem] font-bold text-ink2 mb-2 uppercase tracking-wide">Monto</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold">$</span>
                    <input type="number" name="monto" required min="0.01" step="0.01" placeholder="0.00" className="w-full bg-cream border-none p-4 pl-8 rounded-xl text-[0.95rem] outline-none focus:ring-2 focus:ring-gold/50 font-mono" />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full justify-center mt-2 h-12 text-[1rem] shrink-0">
                  Guardar Registro
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Añadir Meta */}
      {showMetaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-[fadeUp_0.2s_ease]">
          <div className="bg-card w-full max-w-md rounded-[24px] shadow-lg overflow-hidden border border-border">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="font-serif text-xl font-bold">Nueva Meta de Ahorro</h3>
              <button onClick={() => setShowMetaModal(false)} className="text-muted hover:text-ink"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddMeta} className="p-6 flex flex-col gap-5">
              
              <div>
                <label className="block text-[0.8rem] font-bold text-ink2 mb-2 uppercase tracking-wide">Nombre de la Meta</label>
                <input type="text" name="nombre" required placeholder="Ej. Comprar Coche" className="w-full bg-cream border-none p-4 rounded-xl text-[0.95rem] outline-none focus:ring-2 focus:ring-gold/50" />
              </div>

              <div>
                <label className="block text-[0.8rem] font-bold text-ink2 mb-2 uppercase tracking-wide">Descripción (Opcional)</label>
                <input type="text" name="descripcion" placeholder="Ej. Ahorro para enganche" className="w-full bg-cream border-none p-4 rounded-xl text-[0.95rem] outline-none focus:ring-2 focus:ring-gold/50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[0.8rem] font-bold text-ink2 mb-2 uppercase tracking-wide">Objetivo ($)</label>
                    <input type="number" name="objetivo" required min="1" step="1" placeholder="5000" className="w-full bg-cream border-none p-4 rounded-xl text-[0.95rem] outline-none focus:ring-2 focus:ring-gold/50 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[0.8rem] font-bold text-ink2 mb-2 uppercase tracking-wide">Ahorrado ($)</label>
                    <input type="number" name="actual" min="0" step="1" defaultValue="0" placeholder="0" className="w-full bg-cream border-none p-4 rounded-xl text-[0.95rem] outline-none focus:ring-2 focus:ring-gold/50 font-mono" />
                  </div>
              </div>

              <button type="submit" className="btn btn-primary w-full justify-center mt-2 h-12 text-[1rem]">
                Crear Meta
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

