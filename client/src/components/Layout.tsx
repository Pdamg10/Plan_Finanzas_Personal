import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  Receipt, 
  Tags, 
  PieChart, 
  Target, 
  Repeat, 
  Bell, 
  BarChart3, 
  Settings,
  LogOut,
  X,
  Menu,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const d = new Date();
    setDateStr(d.toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' }));
  }, []);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Receipt, label: 'Transacciones', path: '/transactions' },
  ];

  const managementNavItems = [
    { icon: CreditCard, label: 'Cuentas', path: '/accounts' },
    { icon: PieChart, label: 'Presupuestos', path: '/budgets' },
    { icon: BarChart3, label: 'Reportes', path: '/reports' },
    { icon: Tags, label: 'Categorías', path: '/categories' },
    { icon: Target, label: 'Metas', path: '/goals' },
    { icon: Repeat, label: 'Recurrentes', path: '/recurring' },
    { icon: Bell, label: 'Recordatorios', path: '/reminders' },
  ];

  const settingsNavItems = [
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  const renderNavItems = (items: any[]) => items.map(item => {
    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center gap-3 px-7 py-3 text-[0.88rem] font-medium rounded-r-lg mx-2 border-l-4 transition-all ${
          isActive 
            ? 'text-white bg-[rgba(201,146,42,0.12)] border-gold' 
            : 'text-white/50 border-transparent hover:text-white/85 hover:bg-white/5'
        }`}
        onClick={() => { if(window.innerWidth < 768) setIsSidebarOpen(false); }}
      >
        <item.icon size={16} className="shrink-0" />
        {item.label}
      </Link>
    );
  });

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/transactions')) return 'Transacciones';
    if (path.startsWith('/accounts')) return 'Cuentas';
    if (path.startsWith('/budgets')) return 'Presupuestos';
    if (path.startsWith('/reports')) return 'Reportes';
    if (path.startsWith('/categories')) return 'Categorías';
    if (path.startsWith('/goals')) return 'Metas';
    if (path.startsWith('/recurring')) return 'Recurrentes';
    if (path.startsWith('/reminders')) return 'Recordatorios';
    if (path.startsWith('/settings')) return 'Configuración';
    return 'FinFlow';
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-ink flex flex-col shrink-0 py-8 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-7 pb-8 border-b border-white/10 flex justify-between items-center">
          <div>
            <div className="font-serif text-[1.6rem] font-black text-white tracking-tight leading-none">
              Fin<span className="text-gold">Flow</span>
            </div>
            <div className="font-mono text-[0.7rem] text-white/35 tracking-widest uppercase mt-1">
              Plan Finanzas Personal
            </div>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-white/50">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-[2px] overflow-y-auto">
          <div className="px-7 pt-3 pb-1 text-[0.6rem] font-semibold tracking-widest uppercase text-white/25 mt-3">Principal</div>
          {renderNavItems(mainNavItems)}

          <div className="px-7 pt-3 pb-1 text-[0.6rem] font-semibold tracking-widest uppercase text-white/25 mt-3">Gestión</div>
          {renderNavItems(managementNavItems)}

          <div className="px-7 pt-3 pb-1 text-[0.6rem] font-semibold tracking-widest uppercase text-white/25 mt-3">Ajustes</div>
          {renderNavItems(settingsNavItems)}
        </nav>

        <div className="px-7 pt-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-[#e8a830] grid place-items-center font-bold text-[0.85rem] text-ink shrink-0">
              {user?.nombre?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.85rem] font-semibold text-white truncate">{user?.nombre || 'Usuario'}</div>
              <div className="text-[0.7rem] text-white/35">Plan Personal</div>
            </div>
            <button 
              onClick={logout}
              className="text-white/30 hover:text-red transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0 md:ml-0">
        {/* Topbar */}
        <div className="bg-card border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="md:hidden text-ink">
              <Menu size={24} />
            </button>
            <h1 className="font-serif text-[1.4rem] font-bold tracking-tight">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-[0.72rem] text-muted bg-cream px-3.5 py-1.5 rounded-full hidden sm:block">
              {dateStr}
            </div>
            <Link to="/transactions?new=true" className="btn btn-primary btn-sm hidden sm:flex">
              <Plus size={14} strokeWidth={2.5} />
              Nueva transacción
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 overflow-auto animate-[fadeUp_0.4s_ease]">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </div>
      </main>
      
      {/* Floating Add Button Mobile */}
      <Link 
        to="/transactions?new=true"
        className="fixed bottom-6 right-6 w-14 h-14 bg-ink text-white rounded-full shadow-lg grid place-items-center sm:hidden z-30"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
