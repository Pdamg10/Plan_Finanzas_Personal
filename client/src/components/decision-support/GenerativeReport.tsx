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
        <div className="bg-white/65 p-5 rounded-[12px] border border-white/80 leading-relaxed text-xs text-[var(--ink)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
          {reporte.split('\n').map((line, index) => {
            if (!line.trim()) return <div key={index} className="h-2"></div>;
            
            if (line.startsWith('- ')) {
              const content = line.substring(2);
              const parts = content.split(':');
              if (parts.length > 1) {
                const title = parts[0];
                const rest = parts.slice(1).join(':');
                return (
                  <div key={index} className="flex gap-2 mb-2">
                    <span className="text-[var(--purple)] font-black mt-0.5">•</span>
                    <p>
                      <strong className="text-slate-800">{title}:</strong>
                      {rest}
                    </p>
                  </div>
                );
              }
              return (
                <div key={index} className="flex gap-2 mb-2">
                  <span className="text-[var(--purple)] font-black mt-0.5">•</span>
                  <p>{content}</p>
                </div>
              );
            }
            
            if (line.trim() === 'Reporte de Diagnóstico Financiero Personal') {
              return <h3 key={index} className="font-sans font-black text-sm text-[var(--purple)] tracking-wide mb-2 pb-2 border-b border-violet-100/50">{line}</h3>;
            }

            return <p key={index} className="mb-2 text-justify">{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
};
