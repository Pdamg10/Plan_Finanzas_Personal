import { useData, CAT_META } from '../context/DataContext';

export default function BudgetsPage({ setShowBudModal }: any) {
  const { budgets, transactions, deleteBudget, fmt } = useData();

  const now = new Date();
  const currentMonthTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const getBudgetSpent = (cat: string) => currentMonthTxs.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0);

  const over = budgets.filter(b => getBudgetSpent(b.category) >= b.limit).length;
  const tl = budgets.reduce((s, b) => s + b.limit, 0);
  const ts = budgets.reduce((s, b) => s + getBudgetSpent(b.category), 0);

  return (
    <div className="page active">
      <div className="flex items-center justify-between mb-2" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span className="text-muted" style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 600 }}>Controla tus límites de gasto por categoría</span>
        <button className="btn btn-primary btn-sm" onClick={() => setShowBudModal(true)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo presupuesto
        </button>
      </div>

      <div className="grid-main2">
        <div className="card">
          <div className="card-header"><span className="card-title">🎯 Presupuestos Activos</span></div>
          <div className="card-body">
            {budgets.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🎯</div>
                <h3>Sin presupuestos</h3>
                <p>Agrega uno para controlar tus gastos</p>
              </div>
            ) : (
              <div className="budget-list">
                {budgets.map(b => {
                  const meta = CAT_META[b.category] || { emoji: '📦', label: b.category };
                  const spent = getBudgetSpent(b.category);
                  const pct = Math.min((spent / b.limit) * 100, 100);
                  const color = pct >= 100 ? '#f87171' : pct >= 75 ? '#fb923c' : '#a78bfa';
                  return (
                    <div key={b.id} className="bud-item mb-3">
                      <div className="bud-row">
                        <div className="bud-name"><span style={{ marginRight: '0.45rem' }}>{meta.emoji}</span>{meta.label}</div>
                        <div className="bud-amounts"><span className="bud-spent">{fmt(spent)}</span> / {fmt(b.limit)}</div>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: color }}></div>
                      </div>
                      <div className="flex items-center justify-between" style={{ marginTop: '.2rem', display: 'flex', justifyContent: 'space-between' }}>
                        <div className="pct-txt" style={{ textAlign: 'left' }}>{pct.toFixed(0)}% utilizado</div>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '.7rem', color: 'var(--red)', opacity: .5, fontWeight: 700 }} onClick={() => deleteBudget(b.id)}>Eliminar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">📊 Resumen del Mes</span></div>
          <div className="card-body">
            {budgets.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📊</div>
                <h3>Agrega presupuestos</h3>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: '.4rem' }}>Gasto vs presupuesto</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--purple)' }}>{fmt(ts)}</div>
                  <div className="text-muted">de {fmt(tl)} presupuestado</div>
                </div>
                <div className="progress-track" style={{ height: '10px', marginBottom: '.75rem' }}>
                  <div className="progress-fill" style={{ width: `${Math.min((ts / (tl || 1)) * 100, 100).toFixed(0)}%`, background: ts >= tl ? '#f87171' : '#a78bfa' }}></div>
                </div>
                {over > 0 ? (
                  <div style={{ background: 'rgba(248,113,113,.12)', color: '#dc2626', borderRadius: '12px', padding: '.75rem', fontSize: '.8rem', fontWeight: 700, textAlign: 'center', border: '1.5px solid rgba(248,113,113,.2)' }}>
                    ⚠️ {over} presupuesto{over !== 1 ? 's' : ''} excedido{over !== 1 ? 's' : ''}
                  </div>
                ) : (
                  <div style={{ background: 'rgba(52,211,153,.12)', color: 'var(--green-deep)', borderRadius: '12px', padding: '.75rem', fontSize: '.8rem', fontWeight: 700, textAlign: 'center', border: '1.5px solid rgba(52,211,153,.2)' }}>
                    ✅ Todo dentro del presupuesto
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
