import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
    categoria?: { nombre: string };
    cuenta?: { nombre: string };
}

import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'general' | 'month'>('general');
  const [stats, setStats] = useState<DashboardStats>({
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savings: 0
  });
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Re-calculate stats when timeRange changes
  useEffect(() => {
      if (allTransactions.length === 0) return;

      let filtered = allTransactions;
      if (timeRange === 'month') {
          const now = new Date();
          filtered = allTransactions.filter(t => {
              const d = new Date(t.fecha);
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          });
      }

      const totalIncome = filtered.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + Number(t.monto), 0);
      const totalExpense = filtered.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + Number(t.monto), 0);

      setStats(prev => ({
          ...prev,
          monthlyIncome: totalIncome,
          monthlyExpenses: totalExpense,
          savings: totalIncome - totalExpense
      }));

  }, [timeRange, allTransactions]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            // 1. Fetch Accounts for Total Balance
            const accountsRes = await fetch('http://localhost:3000/accounts');
            const accounts = await accountsRes.json();
            const totalBalance = accounts.reduce((acc: number, curr: any) => acc + Number(curr.saldo_actual), 0);

            // 2. Dashboard Stats calculated client-side now
            
            // 3. Fetch Recent Transactions (Actually fetch all for filtering)
            const recentRes = await fetch('http://localhost:3000/transactions');
            const allTrxs = await recentRes.json();
            setAllTransactions(allTrxs);
            setRecentTransactions(allTrxs.slice(0, 5));

            // Initial calc for 'general'
            const totalIncome = allTrxs.filter((t: any) => t.tipo === 'ingreso').reduce((acc: number, t: any) => acc + Number(t.monto), 0);
            const totalExpense = allTrxs.filter((t: any) => t.tipo === 'gasto').reduce((acc: number, t: any) => acc + Number(t.monto), 0);

            setStats({
                totalBalance,
                monthlyIncome: totalIncome,
                monthlyExpenses: totalExpense,
                savings: totalIncome - totalExpense
            });
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando datos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Hola, {user?.nombre}! 👋</h1>
            <p className="text-gray-600 mt-1">Aquí está tu resumen financiero</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
             <div className="bg-white/50 px-1 py-1 rounded-xl flex gap-1">
                <button 
                  onClick={() => setTimeRange('general')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === 'general' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  General
                </button>
                <button 
                  onClick={() => setTimeRange('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === 'month' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Este Mes
                </button>
             </div>
            <button 
                onClick={() => navigate('/accounts')} 
                className="btn-primary shadow-red-500/40"
            >
                + Nueva Tarjeta
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main Stats Chart */}
        <div className="md:col-span-2 card relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ff4757]/20 to-transparent rounded-bl-full pointer-events-none -mr-8 -mt-8"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Balance Total</h3>
            <p className="text-gray-500 text-sm mb-6">Todas las cuentas</p>
            
            <div className="text-4xl font-black text-gray-900 mb-4">
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: user?.moneda_principal || 'USD' }).format(stats.totalBalance)}
            </div>

            <div className="h-32 w-full mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                        { name: 'Start', value: stats.totalBalance * 0.9 },
                        { name: 'Mid', value: stats.totalBalance * 0.95 },
                        { name: 'Now', value: stats.totalBalance }
                    ]}>
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#ff4757" strokeWidth={3} dot={{r: 4, fill: '#ff4757'}} />
                    </LineChart>
                 </ResponsiveContainer>
            </div>
        </div>

        {/* Circular Income/Expense Summary */}
        <div className="md:col-span-1 card flex flex-col justify-center gap-4">
             <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-green-100 text-green-600">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Ingresos</p>
                    <p className="text-xl font-bold text-gray-800">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(stats.monthlyIncome)}
                    </p>
                </div>
             </div>
             <div className="w-full h-px bg-gray-100"></div>
             <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-red-100 text-red-600">
                    <TrendingDown size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Gastos</p>
                    <p className="text-xl font-bold text-gray-800">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(stats.monthlyExpenses)}
                    </p>
                </div>
             </div>
             <div className="w-full h-px bg-gray-100"></div>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
                    <DollarSign size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Ahorro</p>
                    <p className="text-xl font-bold text-gray-800">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(stats.savings)}
                    </p>
                </div>
             </div>
        </div>

        {/* Quick Actions / Goals Placeholder */}
        <div className="md:col-span-1 flex flex-col gap-6">
            <div className="card bg-gradient-to-br from-[#ff4757] to-[#ff6b6b] text-white border-none shadow-red-500/40 flex flex-col justify-center items-center text-center p-8">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                    <Activity size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-lg mb-1">Tu Actividad</h3>
                <p className="text-white/80 text-xs mb-4">Verificamos {recentTransactions.length} movimientos</p>
                <button className="bg-white text-[#ff4757] px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-lg transition-all">
                    Ver Reporte
                </button>
            </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="grid grid-cols-1 gap-6">
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Actividad Reciente</h3>
                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors"><Activity size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
                {recentTransactions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay transacciones recientes.</p>
                ) : (
                    recentTransactions.map((t) => (
                        <div key={t.id} className="p-4 rounded-2xl bg-white/50 border border-white/60 hover:bg-white hover:shadow-md transition-all flex items-center gap-4 group cursor-pointer">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                                t.tipo === 'ingreso' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                            }`}>
                                {t.tipo === 'ingreso' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-800 truncate">{t.descripcion}</h4>
                                <p className="text-xs text-gray-500 font-medium">{t.categoria?.nombre || 'Sin categoría'} • {new Date(t.fecha).toLocaleDateString()}</p>
                            </div>
                            <div className={`font-bold text-lg ${t.tipo === 'ingreso' ? 'text-green-600' : 'text-gray-800'}`}>
                                {t.tipo === 'ingreso' ? '+' : '-'}${Number(t.monto).toLocaleString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

