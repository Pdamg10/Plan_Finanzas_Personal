import { ReactNode, useState, useEffect } from 'react';

interface LayoutProps {
  children?: ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  setShowTxModal: (show: boolean) => void;
}

export default function Layout({ children, activePage, setActivePage, setShowTxModal }: LayoutProps) {
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setDateStr(d.toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' }));
    };
    updateTime();
  }, []);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
    },
    {
      id: 'transactions',
      label: 'Transacciones',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4"/></svg>
    },
    {
      id: 'accounts',
      label: 'Cuentas',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
    },
    {
      id: 'budgets',
      label: 'Presupuestos',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    }
  ];

  return (
    <>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div className="brand-name">FinFlow</div>
          <div className="brand-sub">Finanzas Personales</div>
        </div>

        <nav className="nav">
          {navItems.map(item => (
            <div 
              key={item.id} 
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              {item.icon}
              {item.label}
              <span className="nav-dot"></span>
            </div>
          ))}
        </nav>


      </aside>

      {/* MAIN */}
      <div className="main">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Buscar transacción..." />
          </div>
          <div className="topbar-right">
            <div className="top-date">{dateStr}</div>
            <button className="btn-add" onClick={() => setShowTxModal(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
              Nueva transacción
            </button>
          </div>
        </div>

        {/* Dynamic Page Content */}
        {children}
      </div>
    </>
  );
}
