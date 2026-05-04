import { useData, CAT_META } from '../context/DataContext';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { transactions, accounts, fmt, fmtShort } = useData();

  const now = new Date();
  const currentMonthTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const inc = currentMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const exp = currentMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const sav = accounts.reduce((s, a) => s + a.balance, 0);

  const getAccountName = (id: string) => {
    const a = accounts.find(a => a.id === id);
    return a ? a.name : '—';
  };

  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleDateString('es-ES', { month: 'short' });
    const monthTxs = transactions.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    const mInc = monthTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const mExp = monthTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    chartData.push({ name: i === 0 ? 'Actual' : monthName, inc: mInc, exp: mExp });
  }

  const catMap: Record<string, number> = {};
  currentMonthTxs.filter(t => t.type === 'expense').forEach(t => {
    const cat = CAT_META[t.category]?.label || 'General';
    catMap[cat] = (catMap[cat] || 0) + t.amount;
  });
  const categoryData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] })).sort((a, b) => b.value - a.value);

  const COLORS = ['#8b5cf6', '#ec4899', '#60a5fa', '#34d399', '#fb923c', '#a5b4fc', '#f472b6'];

  return (
    <div className="page active">
      {/* Welcome bar */}
      <div className="welcome">
        <div className="welcome-text">
          <h2>¡Bienvenido! 👋</h2>
          <p>Aquí está el resumen de tus finanzas de este mes</p>
        </div>
        <div className="welcome-badges">
          <div className="wb">
            <div className="wb-val">${fmtShort(inc)}</div>
            <div className="wb-lbl">Ingresos</div>
          </div>
          <div className="wb">
            <div className="wb-val" style={{ color: 'var(--pink)' }}>${fmtShort(exp)}</div>
            <div className="wb-lbl">Gastos</div>
          </div>
          <div className="wb">
            <div className="wb-val" style={{ color: 'var(--blue-deep)' }}>${fmtShort(inc - exp)}</div>
            <div className="wb-lbl">Balance</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </div>
          <div className="stat-lbl">Ingresos del mes</div>
          <div className="stat-val">{fmt(inc)}</div>
          <div className="stat-sub">↑ este mes</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </div>
          <div className="stat-lbl">Gastos del mes</div>
          <div className="stat-val">{fmt(exp)}</div>
          <div className="stat-sub">↓ este mes</div>
        </div>
        <div className="stat-card balance">
          <div className="stat-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div className="stat-lbl">Balance neto</div>
          <div className="stat-val">{fmt(inc - exp)}</div>
          <div className="stat-sub">ingreso − gasto</div>
        </div>
        <div className="stat-card savings">
          <div className="stat-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div className="stat-lbl">Total patrimonio</div>
          <div className="stat-val">{fmt(sav)}</div>
          <div className="stat-sub">todas las cuentas</div>
        </div>
      </div>

      <div className="grid-main mb-3">
        {/* Bar chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Actividad Semanal — Últimos 6 meses</span>
          </div>
          <div className="card-body">
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: '1px solid var(--glass-border)' }} formatter={(value: number) => fmt(value)} />
                  <Line type="monotone" dataKey="inc" name="Ingresos" stroke="var(--purple)" strokeWidth={3} dot={{r: 0}} activeDot={{r: 6, fill: 'var(--purple)'}} />
                  <Line type="monotone" dataKey="exp" name="Gastos" stroke="var(--pink)" strokeWidth={3} dot={{r: 0}} activeDot={{r: 6, fill: 'var(--pink)'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Donut */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🎯 Habilidades de Gasto</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '150px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                    {categoryData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: '1px solid var(--glass-border)' }} formatter={(value: number) => fmt(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-2 flex flex-col gap-2 max-h-[80px] overflow-y-auto pr-2" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex justify-between items-center text-[0.77rem]" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.77rem' }}>
                  <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--ink)' }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length] }}></span>
                    {cat.name}
                  </div>
                  <span className="font-bold text-muted" style={{ fontWeight: 700, color: 'var(--muted)' }}>{fmtShort(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <span className="card-title">🕐 Transacciones Recientes</span>
        </div>
        <div className="card-body">
          <div className="tx-list">
            {transactions.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">💸</div>
                <h3>Sin transacciones</h3>
                <p>Agrega una para empezar</p>
              </div>
            ) : (
              transactions.slice(0, 5).map(t => {
                const meta = CAT_META[t.category] || { emoji: '📦', label: 'Otros', color: '#cbd5e1' };
                const sign = t.type === 'income' ? '+' : '-';
                const dateStr = new Date(t.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                return (
                  <div key={t.id} className="tx-item">
                    <div className="tx-icon" style={{ background: `${meta.color}28` }}>{meta.emoji}</div>
                    <div className="tx-info">
                      <div className="tx-name">{t.desc}</div>
                      <div className="tx-meta">{meta.label} · {dateStr} · {getAccountName(t.account)}</div>
                    </div>
                    <div className={`tx-amt ${t.type === 'income' ? 'in' : 'out'}`}>{sign}{fmt(t.amount)}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
