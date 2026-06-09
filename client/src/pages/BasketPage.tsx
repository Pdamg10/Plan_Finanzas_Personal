import { useState, useEffect } from 'react';
import { useDecisionSupport } from '../context/DecisionSupportContext';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';

export default function BasketPage() {
  const { products, comprasCanasta, addToBasket, removeFromBasket } = useDecisionSupport();

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [purchaseQty, setPurchaseQty] = useState<string>('1');
  const [purchasePrice, setPurchasePrice] = useState<string>('');

  useEffect(() => {
    if (products.length > 0) {
      setSelectedProductId(String(products[0].id));
      setPurchasePrice(String(products[0].precio_referencia_cendas));
    }
  }, [products]);

  useEffect(() => {
    if (selectedProductId) {
      const prod = products.find(p => p.id === Number(selectedProductId));
      if (prod) {
        setPurchasePrice(String(prod.precio_referencia_cendas));
      }
    }
  }, [selectedProductId, products]);

  const handleAdd = () => {
    if (!selectedProductId || !purchaseQty || !purchasePrice) return;
    addToBasket(Number(selectedProductId), Number(purchaseQty), Number(purchasePrice));
    setPurchaseQty('1');
  };

  return (
    <div className="page active space-y-6">
      <div className="pb-2">
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--ink)]">Canasta Básica Real</h1>
        <p className="text-xs text-[var(--text2)] font-semibold mt-1">Simulación de compras de alimentos reales comparadas con el tabulador CENDAS</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <AlertTriangle size={16} className="text-[var(--red)]" />
            3. Canasta Básica Alimentaria Real
          </span>
        </div>
        <div className="card-body space-y-4">
          {/* Simulator selection */}
          <div className="bg-white/45 p-4 rounded-[16px] border border-white/60 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 field">
                <label className="!text-[8px] font-bold uppercase tracking-wider text-slate-500">Seleccionar Producto CENDAS</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="!py-2 !text-xs mt-1 w-full rounded-[12px] border border-white/60 bg-white/45"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.unidad_medida})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 field">
                <label className="!text-[8px] font-bold uppercase tracking-wider text-slate-500">Cantidad</label>
                <input
                  type="number"
                  value={purchaseQty}
                  onChange={(e) => setPurchaseQty(e.target.value)}
                  className="!py-2 !text-xs font-mono mt-1 w-full rounded-[12px] border border-white/60 bg-white/45"
                />
              </div>

              <div className="md:col-span-3 field">
                <label className="!text-[8px] font-bold uppercase tracking-wider text-slate-500">Precio Pagado ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="!py-2 !text-xs font-mono mt-1 w-full rounded-[12px] border border-white/60 bg-white/45"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="btn btn-primary btn-sm !w-full flex justify-center items-center gap-1 py-2 rounded-[12px]"
            >
              <Plus size={14} /> Añadir a Canasta Real
            </button>
          </div>

          {/* List items currently in food basket */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {comprasCanasta.map((c) => {
              const reference = products.find(p => p.id === c.productoId)?.precio_referencia_cendas || c.precioUnitario;
              const priceDelta = ((c.precioUnitario - reference) / reference) * 100;
              
              return (
                <div key={c.productoId} className="p-3 rounded-[12px] bg-white/45 border border-white/60 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-[var(--ink)]">{c.nombre}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {c.cantidad} uds · ${c.precioUnitario.toFixed(2)} pagado (Ref: ${reference.toFixed(2)})
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-mono font-bold text-slate-700">${(c.cantidad * c.precioUnitario).toFixed(2)}</p>
                      {priceDelta > 15 && (
                        <span className="badge badge-red !px-1.5 !py-0.25 !text-[7px]">+{priceDelta.toFixed(0)}% infl.</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromBasket(c.productoId)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
