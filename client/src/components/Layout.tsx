import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvatarGradient } from '../utils/avatarColors';

interface LayoutProps {
  children?: ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
}

export default function Layout({ children, activePage, setActivePage }: LayoutProps) {
  const { user, logout } = useAuth();
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
      label: 'Resumen Financiero',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
    },
    {
      id: 'savings',
      label: 'Presupuesto y Ahorro',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    },
    {
      id: 'fixed-expenses',
      label: 'Gastos Fijos',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
    },
    {
      id: 'basket',
      label: 'Canasta Básica',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    },
    {
      id: 'substitutions',
      label: 'Sustituciones',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
    },
    {
      id: 'report',
      label: 'Reporte CEPAL',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
    },
    {
      id: 'user-settings',
      label: 'Configuración',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
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

        <nav className="nav" style={{ flex: '1 1 auto', overflowY: 'auto' }}>
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

        {/* USER PROFILE + LOGOUT — siempre fijado al fondo del sidebar */}
        <div style={{ paddingTop: '1rem', borderTop: '1.5px solid rgba(255,255,255,0.6)', flexShrink: 0 }}>
          <div className="flex items-center justify-between gap-3 text-[var(--ink)]">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0"
                style={{ background: getAvatarGradient(user?.avatar_color) }}
              >
                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
              </div>
              {/* Name & email */}
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs truncate leading-tight">{user?.nombre || 'Usuario'}</span>
                <span className="text-[9px] text-slate-500 font-semibold truncate leading-none mt-0.5">{user?.email || ''}</span>
              </div>
            </div>
            {/* Logout button */}
            <button 
              onClick={logout}
              title="Cerrar sesión"
              className="p-2 rounded-[8px] hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </div>

      </aside>

      {/* MAIN */}
      <div className="main">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="text-[var(--ink)] font-bold text-xs uppercase tracking-wider bg-white/40 border border-white/60 px-3 py-1 rounded-[8px]">
            Sistema de Soporte de Decisiones Financieras
          </div>
          <div className="topbar-right">
            <div className="top-date font-bold text-xs text-slate-600">{dateStr}</div>
          </div>
        </div>

        {/* Dynamic Page Content */}
        {children}
      </div>
    </>
  );
}
