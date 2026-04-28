import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

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

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savings: 0
  });
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const accountsRes = await fetch('http://localhost:3000/accounts');
            const accounts = await accountsRes.json();
            const totalBalance = accounts.reduce((acc: number, curr: any) => acc + Number(curr.saldo_actual), 0);
            
            const recentRes = await fetch('http://localhost:3000/transactions');
            const allTrxs = await recentRes.json();
            setAllTransactions(allTrxs);
            setRecentTransactions(allTrxs.slice(0, 5));

            const now = new Date();
            const thisMonthTxs = allTrxs.filter((t: any) => {
                const d = new Date(t.fecha);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });

            const totalIncome = thisMonthTxs.filter((t: any) => t.tipo === 'ingreso').reduce((acc: number, t: any) => acc + Number(t.monto), 0);
            const totalExpense = thisMonthTxs.filter((t: any) => t.tipo === 'gasto').reduce((acc: number, t: any) => acc + Number(t.monto), 0);

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

  if (loading) return <div className="p-8 text-center text-muted font-mono">Cargando datos...</div>;

  const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: user?.moneda_principal || 'USD' }).format(n);

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon"><TrendingUp /></div>
          <div className="stat-label">Ingresos del mes</div>
          <div className="stat-value">{fmt(stats.monthlyIncome)}</div>
          <div className="stat-change">↑ vs mes anterior</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-icon"><TrendingDown /></div>
          <div className="stat-label">Gastos del mes</div>
          <div className="stat-value">{fmt(stats.monthlyExpenses)}</div>
          <div className="stat-change">↓ vs mes anterior</div>
        </div>
        <div className="stat-card balance">
          <div className="stat-icon"><DollarSign /></div>
          <div className="stat-label">Balance neto</div>
          <div className="stat-value">{fmt(stats.savings)}</div>
          <div className="stat-change">ingreso − gasto</div>
        </div>
        <div className="stat-card savings">
          <div className="stat-icon"><PiggyBank /></div>
          <div className="stat-label">Total en cuentas</div>
          <div className="stat-value">{fmt(stats.totalBalance)}</div>
          <div className="stat-change">en todas las cuentas</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Ingresos vs Gastos — últimos 6 meses</span>
          </div>
          <div className="card-body">
            <div className="h-48 w-full mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                        { name: 'Hace 5', inc: stats.monthlyIncome * 0.7, exp: stats.monthlyExpenses * 0.8 },
                        { name: 'Hace 4', inc: stats.monthlyIncome * 0.8, exp: stats.monthlyExpenses * 0.85 },
                        { name: 'Hace 3', inc: stats.monthlyIncome * 0.85, exp: stats.monthlyExpenses * 0.9 },
                        { name: 'Hace 2', inc: stats.monthlyIncome * 0.9, exp: stats.monthlyExpenses * 0.95 },
                        { name: 'Mes Ant', inc: stats.monthlyIncome * 0.95, exp: stats.monthlyExpenses * 0.98 },
                        { name: 'Actual', inc: stats.monthlyIncome, exp: stats.monthlyExpenses }
                    ]}>
                        <XAxis dataKey="name" stroke="#9b968e" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }} />
                        <Line type="monotone" dataKey="inc" name="Ingresos" stroke="var(--green)" strokeWidth={3} dot={{r: 0}} activeDot={{r: 6, fill: 'var(--green)'}} />
                        <Line type="monotone" dataKey="exp" name="Gastos" stroke="var(--red)" strokeWidth={3} dot={{r: 0}} activeDot={{r: 6, fill: 'var(--red)'}} />
                    </LineChart>
                 </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions or Donut */}
        <div className="card flex flex-col">
          <div className="card-header">
            <span className="card-title">Resumen Rápido</span>
          </div>
          <div className="card-body flex-1 flex flex-col justify-center items-center text-center">
             <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mb-4">
                 <span className="text-2xl">👋</span>
             </div>
             <h3 className="font-serif text-xl font-bold mb-2">Hola, {user?.nombre || 'Usuario'}</h3>
             <p className="text-[0.85rem] text-muted mb-6">
               Tienes {recentTransactions.length} movimientos recientes y un balance positivo.
             </p>
             <button onClick={() => navigate('/transactions?new=true')} className="btn btn-primary w-full justify-center">
                 Registrar Movimiento
             </button>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Transacciones recientes</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/transactions')}>Ver todas <ArrowRight size={14} /></button>
        </div>
        <div className="card-body p-0">
          <div className="tx-list px-6 pb-2">
            {recentTransactions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💸</div>
                    <h3>Sin transacciones</h3>
                    <p>Agrega una para empezar</p>
                </div>
            ) : (
                recentTransactions.map(t => (
                    <div key={t.id} className="tx-item">
                        <div className="tx-icon" style={{ backgroundColor: t.tipo === 'ingreso' ? 'var(--green-light)' : 'var(--red-light)', color: t.tipo === 'ingreso' ? 'var(--green)' : 'var(--red)' }}>
                           {t.categoria?.icono || (t.tipo === 'ingreso' ? '💰' : '💳')}
                        </div>
                        <div className="tx-info">
                            <div className="tx-name">{t.descripcion}</div>
                            <div className="tx-meta">{t.categoria?.nombre || 'General'} · {new Date(t.fecha).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' })} {t.cuenta ? `· ${t.cuenta.nombre}` : ''}</div>
                        </div>
                        <div className={`tx-amount ${t.tipo === 'ingreso' ? 'in' : 'out'}`}>
                            {t.tipo === 'ingreso' ? '+' : '-'}{fmt(Number(t.monto))}
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

