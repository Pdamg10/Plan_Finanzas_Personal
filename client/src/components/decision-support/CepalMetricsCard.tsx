import React from 'react';

interface CepalMetricsCardProps {
  indice: number;
  clasificacion: 'Bienestar' | 'Vulnerabilidad' | 'Pobreza';
  costoCanasta: number;
  indiceEsfuerzoLaboral?: number; // IELE
}

export const CepalMetricsCard: React.FC<CepalMetricsCardProps> = ({ 
  indice, 
  clasificacion, 
  costoCanasta,
  indiceEsfuerzoLaboral = 0
}) => {
  const getGradient = () => {
    if (clasificacion === 'Bienestar') return 'from-emerald-600 to-teal-500';
    if (clasificacion === 'Vulnerabilidad') return 'from-amber-600 to-orange-500';
    return 'from-rose-600 to-red-500';
  };

  const getBadgeClass = () => {
    if (clasificacion === 'Bienestar') return 'badge-green';
    if (clasificacion === 'Vulnerabilidad') return 'badge-orange';
    return 'badge-red';
  };

  return (
    <div className="card text-[var(--ink)]">
      <div className="card-header">
        <span className="card-title">📊 Indicador CEPAL & IELE</span>
      </div>
      <div className="card-body space-y-4">
        <div className="flex justify-between items-baseline">
          <div>
            <span className={`text-3xl font-extrabold bg-gradient-to-r ${getGradient()} bg-clip-text text-transparent`}>
              {indice.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">del ingreso neto</span>
          </div>
          <span className={`badge ${getBadgeClass()}`}>{clasificacion}</span>
        </div>

        {/* Barra de progreso visual (.progress-track style matching) */}
        <div className="w-full bg-indigo-100/50 h-2.5 rounded-full overflow-hidden flex border border-white/60">
          <div 
            className="bg-emerald-400 h-full transition-all duration-500" 
            style={{ width: `${Math.min(indice, 35)}%` }} 
          />
          <div 
            className="bg-amber-400 h-full transition-all duration-500" 
            style={{ width: `${Math.max(0, Math.min(indice - 35, 15))}%` }} 
          />
          <div 
            className="bg-red-400 h-full transition-all duration-500" 
            style={{ width: `${Math.max(0, indice - 50)}%` }} 
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white/45 border border-white/60 rounded-[12px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
            <span className="text-[9px] text-[var(--text2)] font-extrabold uppercase tracking-wider block mb-1">Costo Canasta</span>
            <span className="font-bold text-[var(--ink)]">${costoCanasta.toFixed(2)}</span>
          </div>
          <div className="p-3 bg-white/45 border border-white/60 rounded-[12px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
            <span className="text-[9px] text-[var(--text2)] font-extrabold uppercase tracking-wider block mb-1">Límite CEPAL</span>
            <span className="font-bold text-[var(--ink)]">35% Máx</span>
          </div>

          {indiceEsfuerzoLaboral > 0 && (
            <div className="p-3 bg-white/45 border border-white/60 rounded-[12px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)] col-span-2 flex justify-between items-center">
              <span className="text-[9px] text-[var(--text2)] font-extrabold uppercase tracking-wider">Esfuerzo Laboral (IELE)</span>
              <span className="font-bold text-[var(--ink)]">{indiceEsfuerzoLaboral.toFixed(1)} días/mes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
