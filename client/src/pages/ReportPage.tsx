import { useDecisionSupport } from '../context/DecisionSupportContext';
import { GenerativeReport } from '../components/decision-support/GenerativeReport';
import { BookOpen } from 'lucide-react';

export default function ReportPage() {
  const { result } = useDecisionSupport();

  return (
    <div className="page active space-y-6">
      <div className="pb-2">
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--ink)]">Reporte Ejecutivo CEPAL</h1>
        <p className="text-xs text-[var(--text2)] font-semibold mt-1">Conclusiones de vulnerabilidad y estrategias de reestructuración financiera automatizadas</p>
      </div>

      {result ? (
        <GenerativeReport reporte={result.reporteGenerativo} />
      ) : (
        <div className="card">
          <div className="card-body text-center text-slate-500 py-12">
            <BookOpen className="mx-auto text-[var(--purple-soft)] mb-3" size={28} />
            <p className="text-xs font-bold text-[var(--ink)]">Esperando simulación...</p>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Configura tus ingresos y canasta básica para generar el reporte ejecutivo.</p>
          </div>
        </div>
      )}
    </div>
  );
}
