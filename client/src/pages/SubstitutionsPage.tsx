import { useDecisionSupport } from '../context/DecisionSupportContext';
import { SubstitutionPanel } from '../components/decision-support/SubstitutionPanel';
import { Sparkles } from 'lucide-react';

export default function SubstitutionsPage() {
  const { result } = useDecisionSupport();

  return (
    <div className="page active space-y-6">
      <div className="pb-2">
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--ink)]">Optimización y Sustituciones</h1>
        <p className="text-xs text-[var(--text2)] font-semibold mt-1">Recomendaciones microeconómicas inteligentes para mitigar la inflación detectada en la canasta</p>
      </div>

      {result ? (
        <SubstitutionPanel sugerencias={result.sustitucionesSugeridas} />
      ) : (
        <div className="card">
          <div className="card-body text-center text-slate-500 py-12">
            <Sparkles className="mx-auto text-[var(--purple-soft)] mb-3" size={28} />
            <p className="text-xs font-bold text-[var(--ink)]">Esperando simulación...</p>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Configura tus ingresos y canasta básica para ver las recomendaciones.</p>
          </div>
        </div>
      )}
    </div>
  );
}
