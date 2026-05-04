import { useData, CAT_META } from '../context/DataContext';

export default function ReportsPage() {
  const { transactions, fmt } = useData();
  const now = new Date();

  const getMonthTxs = (y: number, m: number) => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  };

  const getSavingsRates = () => {
    const rows = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const txs = getMonthTxs(d.getFullYear(), d.getMonth());
      const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const rate = inc > 0 ? ((inc - exp) / inc * 100) : 0;
      rows.push({
        label: d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        rate,
        color: rate >= 20 ? '#a78bfa' : rate >= 0 ? '#fb923c' : '#f87171'
      });
    }
    return rows;
  };

  const getTopCategories = () => {
    const byCat: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      byCat[t.category] = (byCat[t.category] || 0) + t.amount;
    });
    return Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const savingsRates = getSavingsRates();
  const topCategories = getTopCategories();
  const topMax = topCategories.length ? topCategories[0][1] : 1;

  return (
    <div className="page active">
      <div className="reports-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">💚 Tasa de Ahorro Mensual</span></div>
          <div className="card-body">
            {savingsRates.map((r, i) => (
              <div key={i} style={{ marginBottom: '.8rem' }}>
                <div className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.3rem' }}>
                  <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink)', textTransform: 'capitalize' }}>{r.label}</span>
                  <span style={{ fontSize: '.75rem', fontWeight: 800, color: r.color }}>{r.rate.toFixed(1)}%</span>
                </div>
                <div className="progress-track" style={{ height: '6px' }}>
                  <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(r.rate, 100)).toFixed(0)}%`, background: r.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">🏆 Top Categorías de Gasto (Histórico)</span></div>
          <div className="card-body">
            {topCategories.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📊</div>
                <h3>Sin datos</h3>
              </div>
            ) : (
              topCategories.map(([cat, val]) => {
                const meta = CAT_META[cat] || { emoji: '📦', label: cat, color: '#cbd5e1' };
                return (
                  <div key={cat} style={{ marginBottom: '.8rem' }}>
                    <div className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.3rem' }}>
                      <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink)' }}>{meta.emoji} {meta.label}</span>
                      <span style={{ fontSize: '.75rem', fontWeight: 800, color: meta.color }}>{fmt(val)}</span>
                    </div>
                    <div className="progress-track" style={{ height: '6px' }}>
                      <div className="progress-fill" style={{ width: `${(val / topMax * 100).toFixed(0)}%`, background: meta.color }}></div>
                    </div>
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
