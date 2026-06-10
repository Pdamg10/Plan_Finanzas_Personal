import React from 'react';

interface SustitucionSugerida {
  productoOriginal: string;
  grupoNutricional: string;
  precioPagado: number;
  precioCendasReferencia: number;
  inflacionRegistrada: number;
  productoSustitutoSugerido: string;
  precioSustitutoReferencia: number;
  ahorroEstimadoPorUnidad: number;
}

interface SubstitutionPanelProps {
  sugerencias: SustitucionSugerida[];
}

export const SubstitutionPanel: React.FC<SubstitutionPanelProps> = ({ sugerencias }) => {
  if (sugerencias.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center text-slate-500 py-6">
          <svg
            className="mx-auto h-7 w-7 text-slate-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs font-bold text-[var(--ink)] block">Precios estables respecto a CENDAS</span>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">No se requiere activar protocolos de sustitución microeconómica.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[var(--text2)] text-[10px] uppercase tracking-wider font-extrabold">
          Alertas de Sustitución CENDAS
        </h3>
        <span className="badge badge-orange">
          {sugerencias.length} alertas
        </span>
      </div>

      <div className="space-y-3">
        {sugerencias.map((sug, idx) => {
          let bgColorClass = "bg-white/55 border-orange-200/50";
          let badgeColorClass = "text-amber-700 bg-amber-50 border-amber-200/40";
          
          if (sug.inflacionRegistrada < 15) {
            bgColorClass = "bg-emerald-50/70 border-emerald-200/60";
            badgeColorClass = "text-emerald-700 bg-emerald-100 border-emerald-200";
          } else if (sug.inflacionRegistrada < 40) {
            bgColorClass = "bg-amber-50/70 border-amber-200/60";
            badgeColorClass = "text-amber-700 bg-amber-100 border-amber-200";
          } else {
            bgColorClass = "bg-rose-50/70 border-rose-200/60";
            badgeColorClass = "text-rose-700 bg-rose-100 border-rose-200";
          }

          return (
          <div
            key={`${sug.productoOriginal}-${idx}`}
            className={`p-4 rounded-[18px] border ${bgColorClass} text-[var(--ink)] flex flex-col sm:flex-row justify-between gap-3 shadow-[var(--shadow-card)] transition-colors duration-300`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded border ${badgeColorClass}`}>
                  Inflación +{sug.inflacionRegistrada}%
                </span>
                <span className="text-[9px] text-[var(--muted)] font-extrabold uppercase tracking-wider">{sug.grupoNutricional}</span>
              </div>
              <p className="text-xs font-bold text-[var(--ink)]">
                {sug.productoOriginal}{' '}
                <span className="text-[10px] font-normal text-slate-500">
                  (Pagado: ${sug.precioPagado.toFixed(2)} / Ref: ${sug.precioCendasReferencia.toFixed(2)})
                </span>
              </p>
              
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <span className="text-emerald-600 font-bold">Sustituto:</span>
                <span>{sug.productoSustitutoSugerido} (${sug.precioSustitutoReferencia.toFixed(2)} ref)</span>
              </div>
            </div>

            <div className="flex flex-col justify-center items-end bg-emerald-50 border border-emerald-100 rounded-[12px] px-3.5 py-1.5 self-start sm:self-center">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Ahorro Estimado</span>
              <span className="font-mono text-sm font-extrabold text-emerald-600">
                -${sug.ahorroEstimadoPorUnidad.toFixed(2)}
                <span className="text-[9px] font-normal text-slate-400 ml-0.5">/ ud</span>
              </span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};
