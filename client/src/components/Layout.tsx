import { ReactNode, useState, useEffect } from 'react';
import { Plus, Download } from 'lucide-react';

interface LayoutProps {
  children?: ReactNode;
  onNewTransaction?: () => void;
}

export default function Layout({ children, onNewTransaction }: LayoutProps) {
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setDateStr(d.toLocaleString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Unified Topbar */}
      <header className="bg-ink text-white border-b border-ink2 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="font-serif text-[1.4rem] font-black tracking-tight leading-none">
              Fin<span className="text-gold">Flow</span>
            </div>
          </div>
          
          <div className="hidden md:block w-px h-6 bg-white/10"></div>
          
          <h1 className="hidden md:block font-serif text-[1.1rem] text-white/90">Panel de Control</h1>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <div className="font-mono text-[0.72rem] text-white/50 hidden sm:block">
            {dateStr}
          </div>
          
          <button 
             onClick={() => window.dispatchEvent(new CustomEvent('export-excel'))}
             className="btn btn-sm border border-white/20 text-white/70 hover:text-white hover:bg-white/10 hidden sm:flex items-center gap-2"
          >
             <Download size={14} />
             Exportar Excel
          </button>
          
          <button onClick={onNewTransaction} className="btn btn-primary btn-sm flex items-center gap-2">
            <Plus size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Añadir Registro</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 text-ink">
        <div className="flex-1 p-4 lg:p-10 overflow-auto animate-[fadeUp_0.4s_ease]">
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
      
      {/* Floating Add Button Mobile */}
      <button 
        onClick={onNewTransaction}
        className="fixed bottom-6 right-6 w-14 h-14 bg-ink text-white rounded-full shadow-lg grid place-items-center sm:hidden z-30"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
