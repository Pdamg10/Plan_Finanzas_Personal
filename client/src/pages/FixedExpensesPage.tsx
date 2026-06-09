import { useState } from 'react';
import { useDecisionSupport } from '../context/DecisionSupportContext';
import { ShieldAlert, Trash2, Plus } from 'lucide-react';

export default function FixedExpensesPage() {
  const { gastosFijos, addFixedExpense, removeFixedExpense } = useDecisionSupport();
  const [nuevoGastoNombre, setNuevoGastoNombre] = useState('');
  const [nuevoGastoMonto, setNuevoGastoMonto] = useState('');

  const handleAdd = () => {
    if (!nuevoGastoNombre || !nuevoGastoMonto) return;
    addFixedExpense(nuevoGastoNombre, Number(nuevoGastoMonto));
    setNuevoGastoNombre('');
    setNuevoGastoMonto('');
  };

  return (
    <div className="page active space-y-6">
      <div className="pb-2">
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--ink)]">Gastos Fijos Contractuales</h1>
        <p className="text-xs text-[var(--text2)] font-semibold mt-1">Administración de deudas, matrícula, vivienda, transporte y servicios fijos</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <ShieldAlert size={16} className="text-[var(--orange)]" />
            2. Gastos Fijos Contractuales
          </span>
        </div>
        <div className="card-body space-y-4">
          {/* List current fixed expenses */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {gastosFijos.map((g, idx) => (
              <div key={`${g.nombre}-${idx}`} className="flex justify-between items-center p-3 rounded-[12px] bg-white/45 border border-white/60 hover:bg-white/60 transition-all text-xs">
                <div className="flex items-center gap-2">
                  {g.esEstatica ? (
                    <span className="badge badge-purple !px-1.5 !py-0.5 !text-[8px]">
                      CENDAS
                    </span>
                  ) : (
                    <span className="badge badge-green !px-1.5 !py-0.5 !text-[8px]">
                      Usuario
                    </span>
                  )}
                  <span className="font-bold text-[var(--ink)]">{g.nombre}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-700">${g.monto.toFixed(2)}</span>
                  {!g.esEstatica && (
                    <button
                      type="button"
                      onClick={() => removeFixedExpense(idx)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add new expense */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <div className="sm:col-span-7 field">
              <input
                type="text"
                placeholder="Categoría personalizada (ej: Gimnasio, Ayuda Familiar)"
                value={nuevoGastoNombre}
                onChange={(e) => setNuevoGastoNombre(e.target.value)}
                className="!py-2.5 !text-xs rounded-[12px] border border-white/60 bg-white/45"
              />
            </div>
            <div className="sm:col-span-3 field">
              <input
                type="number"
                placeholder="Monto ($)"
                value={nuevoGastoMonto}
                onChange={(e) => setNuevoGastoMonto(e.target.value)}
                className="!py-2.5 !text-xs font-mono rounded-[12px] border border-white/60 bg-white/45"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAdd}
                className="btn btn-ghost !w-full !py-2.5 flex justify-center items-center rounded-[12px]"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
