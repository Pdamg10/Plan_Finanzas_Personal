import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Menu 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Use window.innerWidth for mobile check in real app, simplistic here
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CreditCard, label: 'Cuentas', path: '/accounts' },
    { icon: Receipt, label: 'Transacciones', path: '/transactions' },
    { icon: Tags, label: 'Categorías', path: '/categories' },
    { icon: PieChart, label: 'Presupuestos', path: '/budgets' },
    { icon: Target, label: 'Metas', path: '/goals' },
    { icon: Repeat, label: 'Recurrentes', path: '/recurring' },
    { icon: Bell, label: 'Recordatorios', path: '/reminders' },
    { icon: BarChart3, label: 'Reportes', path: '/reports' },
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-4 left-4 z-50 w-64 glass-panel rounded-3xl transform transition-transform duration-300 ease-spring ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-[110%]'
        } lg:relative lg:translate-x-0 lg:h-[calc(100vh-2rem)] lg:my-4 lg:ml-4 flex flex-col`}
      >
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center gap-3">
             {/* Logo Icon */}
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/40"></div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">Finanzas</h1>
            <button onClick={toggleSidebar} className="lg:hidden ml-auto text-slate-500">
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 ml-1">Menu</h3>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-white/60 shadow-md text-violet-600' 
                      : 'text-slate-600 hover:bg-white/40 hover:text-slate-900'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-2xl bg-white/40 border border-white/40 shadow-sm backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-md">
                    {user?.nombre?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.nombre || 'Usuario'}</p>
                    <p className="text-[10px] text-slate-500 truncate font-medium">Plan Pro</p>
                </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50/50 rounded-xl transition-colors font-medium text-sm"
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white/30 backdrop-blur-md border-b border-white/40 flex items-center">
          <button onClick={toggleSidebar} className="text-slate-700">
            <Menu size={24} />
          </button>
          <h1 className="ml-4 text-xl font-bold text-slate-900">Finanzas</h1>
        </div>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <OutletWrapper children={children} />
            </div>
        </div>
      </main>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}

// Helper to render children or Outlet if using nested routes in future
import { Outlet } from 'react-router-dom';
const OutletWrapper = ({ children }: { children?: ReactNode }) => {
    return <>{children || <Outlet />}</>;
};
