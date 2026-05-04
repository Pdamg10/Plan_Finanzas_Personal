import { useState } from 'react';
import { useData, CAT_META } from '../context/DataContext';

export default function TransactionsPage() {
  const { transactions, accounts, deleteTransaction, fmt } = useData();
  const [filter, setFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');

  const months = [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort().reverse();

  let filteredTxs = transactions;
  if (filter !== 'all') filteredTxs = filteredTxs.filter(t => t.type === filter);
  if (monthFilter) filteredTxs = filteredTxs.filter(t => t.date.slice(0, 7) === monthFilter);

  const getAccountName = (id: string) => {
    const a = accounts.find(a => a.id === id);
    return a ? a.name : '—';
  };

  return (
    <div className="page active">
      <div className="flex items-center justify-between mb-2" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="flex gap-1" style={{ display: 'flex', gap: '0.5rem' }}>
          <span className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Todos</span>
          <span className={`chip ${filter === 'income' ? 'active' : ''}`} onClick={() => setFilter('income')}>Ingresos</span>
          <span className={`chip ${filter === 'expense' ? 'active' : ''}`} onClick={() => setFilter('expense')}>Gastos</span>
        </div>
        <select className="filter-sel" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
          <option value="">Todos los meses</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 Historial de Movimientos</span>
          <span className="badge badge-purple">{filteredTxs.length} registros</span>
        </div>
        <div className="card-body" style={{ padding: '1.25rem 1.4rem 0' }}>
          <div className="tx-list pb-4">
            {filteredTxs.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📂</div>
                <h3>Sin resultados</h3>
                <p>Ajusta los filtros</p>
              </div>
            ) : (
              filteredTxs.map(t => {
                const meta = CAT_META[t.category] || { emoji: '📦', label: 'Otros', color: '#cbd5e1' };
                const sign = t.type === 'income' ? '+' : '-';
                const dateStr = new Date(t.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                return (
                  <div key={t.id} className="tx-item group">
                    <div className="tx-icon" style={{ background: `${meta.color}28` }}>{meta.emoji}</div>
                    <div className="tx-info">
                      <div className="tx-name">{t.desc}</div>
                      <div className="tx-meta">{meta.label} · {dateStr} · {getAccountName(t.account)}</div>
                    </div>
                    <div className={`tx-amt ${t.type === 'income' ? 'in' : 'out'}`}>{sign}{fmt(t.amount)}</div>
                    <button 
                      className="ml-2 opacity-50 hover:opacity-100 transition-opacity text-red-500 bg-transparent border-none cursor-pointer"
                      onClick={() => deleteTransaction(t.id)}
                    >✕</button>
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
