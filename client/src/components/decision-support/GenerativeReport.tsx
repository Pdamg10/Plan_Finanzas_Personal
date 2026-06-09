import React, { useState } from 'react';

interface GenerativeReportProps {
  reporte: string;
}

export const GenerativeReport: React.FC<GenerativeReportProps> = ({ reporte }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reporte);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([reporte], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `Reporte-Diagnostico-Financiero-${new Date().toISOString().substring(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="card text-[var(--ink)]">
      <div className="card-header">
        <span className="card-title">📝 Diagnóstico Generativo</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-ghost btn-sm !px-2.5 !py-1 !text-[10px]"
          >
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="btn btn-primary btn-sm !px-2.5 !py-1 !text-[10px]"
          >
            Descargar
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="bg-white/65 p-4 rounded-[12px] border border-white/80 leading-relaxed text-xs text-[var(--ink)] font-serif italic shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
          "{reporte}"
        </div>
      </div>
    </div>
  );
};
