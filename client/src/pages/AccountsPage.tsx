import { useData, ACC_TYPE_LABELS } from '../context/DataContext';

export default function AccountsPage({ setShowAccModal }: any) {
  const { accounts, deleteAccount, fmt } = useData();

  const total = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="page active">
      <div className="flex items-center justify-between mb-2" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span className="text-muted" style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 600 }}>Gestiona tus cuentas y carteras</span>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAccModal(true)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
          Nueva cuenta
        </button>
      </div>

      <div className="accounts-grid">
        {accounts.length === 0 ? (
          <div className="empty" style={{ gridColumn: '1/-1' }}>
            <div className="empty-icon">💳</div>
            <h3>Sin cuentas</h3>
          </div>
        ) : (
          accounts.map(a => (
            <div key={a.id} className={`acc-card ${a.color}`}>
              <div className="acc-type">{ACC_TYPE_LABELS[a.type] || a.type}</div>
              <div className="acc-name">{a.name}</div>
              <div className="acc-num">•••• •••• ••••</div>
              <div className="acc-bal-lbl">Saldo disponible</div>
              <div className="acc-bal">{fmt(a.balance)}</div>
            </div>
          ))
        )}
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <span className="card-title">📈 Resumen de cuentas</span>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between mb-2" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 600 }}>Total patrimonio</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--purple)' }}>{fmt(total)}</div>
            </div>
            <span className="badge badge-purple">{accounts.length} cuentas</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {accounts.map(a => (
              <div key={a.id} className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', padding: '.6rem .85rem', background: 'rgba(255,255,255,.5)', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,.8)' }}>
                <span style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--ink)' }}>{a.name}</span>
                <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-purple">{ACC_TYPE_LABELS[a.type] || a.type}</span>
                  <span style={{ fontSize: '.84rem', fontWeight: 800, color: 'var(--purple)' }}>{fmt(a.balance)}</span>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: '.8rem', opacity: .5 }} onClick={() => deleteAccount(a.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
