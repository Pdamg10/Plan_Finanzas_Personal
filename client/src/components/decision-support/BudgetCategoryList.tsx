import React, { useState } from 'react';

interface CategoryData {
  id: number;
  nombre: string;
  monto: number;
  esEstatica: boolean;
}

interface BudgetCategoryListProps {
  categorias: CategoryData[];
}

export const BudgetCategoryList: React.FC<BudgetCategoryListProps> = ({ categorias }) => {
  const [openAccordion, setOpenAccordion] = useState(false);

  // Separar categorías estáticas y dinámicas
  const estaticas = categorias.filter(c => c.esEstatica);
  const dinamicas = categorias.filter(c => !c.esEstatica);
  const totalDinamicas = dinamicas.reduce((sum, c) => sum + c.monto, 0);

  return (
    <div className="space-y-4 text-[var(--ink)]">
      <h3 className="text-[var(--text2)] text-[10px] uppercase tracking-wider font-extrabold mb-2">Estructura de Gastos</h3>

      {/* 1. Renderizado de las 7 Categorías Estáticas (Nodos Primarios) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {estaticas.map(cat => (
          <div key={cat.id} className="p-3 rounded-[12px] border border-white/60 bg-white/45 flex justify-between items-center hover:border-indigo-200 hover:bg-white/65 transition-all duration-300">
            <span className="text-[var(--ink)] font-bold text-xs">{cat.nombre}</span>
            <span className="font-mono text-xs font-extrabold text-[var(--text2)]">
              ${cat.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>

      {/* 2. Nodo Consolidado Asimétrico para Categorías Dinámicas de Usuario */}
      {dinamicas.length > 0 && (
        <div className="border border-indigo-200/50 rounded-[12px] overflow-hidden bg-white/35 shadow-[var(--shadow-card)]">
          <button 
            type="button"
            onClick={() => setOpenAccordion(!openAccordion)}
            className="w-full p-3 flex justify-between items-center hover:bg-white/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-[var(--purple)] text-[9px] font-extrabold uppercase tracking-wider bg-indigo-100/60 px-2 py-0.5 rounded border border-indigo-200/30">
                Personalizadas
              </span>
              <span className="text-[var(--ink)] font-bold text-xs">Otras categorías personalizadas</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-extrabold text-[var(--purple)]">
                ${totalDinamicas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
              <svg 
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${openAccordion ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {openAccordion && (
            <div className="px-3 pb-3 pt-1 border-t border-white/40 divide-y divide-white/40 bg-white/20">
              {dinamicas.map(cat => (
                <div key={cat.id} className="py-2 flex justify-between items-center text-[11px]">
                  <span className="text-slate-600 font-semibold">{cat.nombre}</span>
                  <span className="font-mono text-slate-800 font-bold">
                    ${cat.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
