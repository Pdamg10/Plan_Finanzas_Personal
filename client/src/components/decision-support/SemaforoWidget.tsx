import React from 'react';

interface SemaforoWidgetProps {
  estado: 'Verde' | 'Amarillo' | 'Rojo';
  explicacion: string;
  presupuestoRestante: number;
}

export const SemaforoWidget: React.FC<SemaforoWidgetProps> = ({ estado, explicacion, presupuestoRestante }) => {
  const configs = {
    Verde: {
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-[rgba(255,255,255,0.85)] text-emerald-800 shadow-[var(--shadow-card)]',
      light: 'bg-emerald-500 shadow-emerald-500/50',
      label: 'Superávit Saludable',
      icon: '✓',
      textColor: 'text-emerald-800',
      subtext: 'text-emerald-950/80',
      remanenteText: 'text-emerald-700'
    },
    Amarillo: {
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-[rgba(255,255,255,0.85)] text-amber-800 shadow-[var(--shadow-card)]',
      light: 'bg-amber-500 shadow-amber-500/50',
      label: 'Capacidad Comprometida',
      icon: '⚠',
      textColor: 'text-amber-800',
      subtext: 'text-amber-950/80',
      remanenteText: 'text-amber-700'
    },
    Rojo: {
      bg: 'bg-gradient-to-br from-rose-50 to-rose-100/50 border-[rgba(255,255,255,0.85)] text-rose-800 shadow-[var(--shadow-card)]',
      light: 'bg-rose-500 shadow-rose-500/50',
      label: 'Déficit Estructural',
      icon: '🛑',
      textColor: 'text-rose-800',
      subtext: 'text-rose-950/80',
      remanenteText: 'text-rose-700'
    }
  };

  let current = configs.Verde;
  if (estado === 'Amarillo') {
    current = configs.Amarillo;
  } else if (estado === 'Rojo') {
    current = configs.Rojo;
  }

  return (
    <div className={`p-6 rounded-[20px] border backdrop-blur-[20px] transition-all duration-500 ${current.bg}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`w-3.5 h-3.5 rounded-full ${current.light} animate-pulse shadow-[0_0_10px_2px]`} />
          <h3 className={`font-extrabold text-sm tracking-wide uppercase ${current.textColor}`}>{current.label}</h3>
        </div>
        <span className="text-lg font-extrabold">{current.icon}</span>
      </div>
      
      <p className={`text-xs mb-4 leading-relaxed font-semibold ${current.subtext}`}>
        {explicacion}
      </p>

      <div className="border-t border-black/5 pt-4 flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Remanente de caja</span>
        <span className={`text-base font-mono font-extrabold ${presupuestoRestante >= 0 ? current.remanenteText : 'text-red-600'}`}>
          ${presupuestoRestante.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
};
