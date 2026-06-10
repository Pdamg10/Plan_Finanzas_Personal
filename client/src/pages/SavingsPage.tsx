import { useDecisionSupport } from '../context/DecisionSupportContext';
import { SavingsPrioritizer } from '../components/decision-support/SavingsPrioritizer';
import { Sparkles } from 'lucide-react';

export default function SavingsPage() {
  const { ingresoNeto, setIngresoNeto, porcentajeAhorro, setPorcentajeAhorro } = useDecisionSupport();

  return (
    <div className="page active space-y-6">
      <div className="pb-2">
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--ink)]">Presupuesto y Ahorro</h1>
        <p className="text-xs text-[var(--text2)] font-semibold mt-1">Configuración del ingreso mensual neto y la tasa de ahorro previo obligatorio</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Sparkles size={16} className="text-[var(--purple-soft)]" />
            1. Ingreso & Ahorro Previo Obligatorio
          </span>
        </div>
        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="field">
            <label className="font-bold text-xs">Ingreso Mensual Neto (IMN)</label>
            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
              <input
                type="number"
                value={ingresoNeto === 0 ? '' : ingresoNeto}
                onChange={(e) => setIngresoNeto(Number(e.target.value))}
                placeholder="2500"
                className="w-full !pl-9 font-mono font-bold text-slate-800 rounded-[12px] border border-white/60 bg-white/45 focus:outline-none"
              />
            </div>
          </div>
          
          <SavingsPrioritizer
            ingresoNeto={ingresoNeto}
            porcentajeAhorro={porcentajeAhorro}
            onChangePorcentaje={setPorcentajeAhorro}
          />
        </div>
      </div>
    </div>
  );
}
