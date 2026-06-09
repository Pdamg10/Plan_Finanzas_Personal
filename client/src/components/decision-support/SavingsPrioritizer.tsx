import React from 'react';

interface SavingsPrioritizerProps {
  ingresoNeto: number;
  porcentajeAhorro: number;
  onChangePorcentaje: (val: number) => void;
}

export const SavingsPrioritizer: React.FC<SavingsPrioritizerProps> = ({
  ingresoNeto,
  porcentajeAhorro,
  onChangePorcentaje,
}) => {
  const montoAhorro = ingresoNeto * (porcentajeAhorro / 100);
  const presupuestoDisponible = ingresoNeto - montoAhorro;

  return (
    <div className="card text-[var(--ink)]">
      <div className="card-header">
        <span className="card-title">🎯 Ahorro Previo</span>
        <span className="badge badge-purple">
          Obligatorio
        </span>
      </div>

      <div className="card-body space-y-4">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs text-slate-500 font-bold">Tasa de Ahorro</span>
            <span className="text-2xl font-mono font-extrabold text-[var(--purple)]">{porcentajeAhorro}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={porcentajeAhorro}
            onChange={(e) => onChangePorcentaje(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--purple)]"
          />
          <div className="flex justify-between text-[9px] text-[var(--muted)] font-semibold mt-1">
            <span>0% (Sin ahorro)</span>
            <span>25% (Medio)</span>
            <span>50% (Agresivo)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-black/5 pt-4">
          <div>
            <span className="text-slate-500 text-[9px] font-extrabold uppercase tracking-wider block mb-1">Ahorro Retenido</span>
            <span className="text-xs font-mono font-extrabold text-[var(--text2)]">
              ${montoAhorro.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[9px] font-extrabold uppercase tracking-wider block mb-1">Disponible Restante</span>
            <span className="text-xs font-mono font-extrabold text-emerald-600">
              ${presupuestoDisponible.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
