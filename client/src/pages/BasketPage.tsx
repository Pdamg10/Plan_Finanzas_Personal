import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDecisionSupport } from '../context/DecisionSupportContext';
import { AlertTriangle, Plus, Trash2, BookOpen } from 'lucide-react';

export default function BasketPage() {
  const { products, comprasCanasta, addToBasket, removeFromBasket, addCustomProduct } = useDecisionSupport();

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('Kg');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [purchaseQty, setPurchaseQty] = useState<string>('1');
  const [purchasePrice, setPurchasePrice] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  const uniqueCategories = Array.from(new Set(products.map(p => p.grupo_nutricional))).sort();
  const filteredProducts = products.filter(p => {
    const matchesName = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = searchCategory ? p.grupo_nutricional === searchCategory : true;
    return matchesName && matchesCategory;
  });

  const handleSelectProduct = (prod: any) => {
    setSelectedProductId(String(prod.id));
    setPurchasePrice(String(prod.precio_referencia_cendas));
    setPurchaseQty('1');
  };

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
        <div className="card-body space-y-6">
          {/* Buscador y Selección de Producto */}
          <div className="bg-white/45 p-4 rounded-[16px] border border-white/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                <BookOpen size={16} className="text-[var(--purple)]" />
                Buscador de Productos CENDAS
              </h3>
              <button 
                onClick={() => setShowAddProductModal(true)}
                className="btn btn-primary !px-5 !py-2 !text-[13px]"
              >
                <Plus size={16} /> Nuevo Producto
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="field">
                <input 
                   type="text" 
                   placeholder="Buscar producto por nombre..." 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="field">
                <select value={searchCategory} onChange={e => setSearchCategory(e.target.value)}>
                  <option value="">Todas las categorías</option>
                  {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Lista de productos filtrados */}
            <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredProducts.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => handleSelectProduct(p)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${selectedProductId === String(p.id) ? 'border-[var(--purple)] bg-[var(--purple)]/10' : 'border-white/60 bg-white/30 hover:bg-white/80'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[11px] text-[var(--ink)] leading-tight">{p.nombre}</p>
                      <p className="text-[9px] text-slate-500 font-semibold mt-0.5">{p.grupo_nutricional} · {p.unidad_medida}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-[11px] text-[var(--purple)]">Ref: ${p.precio_referencia_cendas.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs font-semibold">
                  No se encontraron productos.
                </div>
              )}
            </div>

            {/* Controles de cantidad y precio (solo si hay uno seleccionado) */}
            {selectedProductId && (
              <div className="pt-3 border-t border-white/60 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4 field">
                  <label className="!text-[9px]">Cantidad</label>
                  <input 
                    type="number" 
                    value={purchaseQty} 
                    onChange={e => setPurchaseQty(e.target.value)} 
                    className="font-mono text-center"
                  />
                </div>
                <div className="md:col-span-4 field">
                  <label className="!text-[9px]">Precio Pagado ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={purchasePrice} 
                    onChange={e => setPurchasePrice(e.target.value)} 
                    className="font-mono text-center"
                  />
                </div>
                <div className="md:col-span-4">
                  <button 
                    type="button"
                    onClick={handleAdd} 
                    className="btn btn-primary !w-full flex justify-center items-center gap-1 !py-2.5"
                  >
                    <Plus size={14} /> Añadir
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lista de productos en la canasta */}
          <div className="pt-2">
            <h3 className="font-bold text-sm text-[var(--ink)] mb-3 flex items-center justify-between">
              Mi Canasta Real
              <span className="badge badge-purple">{comprasCanasta.length} items</span>
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {comprasCanasta.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-300 rounded-xl">
                  Aún no has agregado productos a tu canasta.
                </div>
              )}
              {comprasCanasta.map((c) => {
                const reference = products.find(p => p.id === c.productoId)?.precio_referencia_cendas || c.precioUnitario;
                const priceDelta = ((c.precioUnitario - reference) / reference) * 100;
                
                return (
                  <div key={c.productoId} className="p-3 rounded-[12px] bg-white/45 border border-white/60 flex justify-between items-center text-xs hover:bg-white/60 transition-colors">
                    <div className="space-y-1">
                      <p className="font-bold text-[var(--ink)]">{c.nombre}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        {c.cantidad} uds · ${c.precioUnitario.toFixed(2)} pagado (Ref: ${reference.toFixed(2)})
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-700">${(c.cantidad * c.precioUnitario).toFixed(2)}</p>
                        {priceDelta > 0 && (
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

      {showAddProductModal && createPortal(
        <div className="overlay show">
          <div className="modal">
            <h2 className="modal-title flex items-center gap-2">
              <Plus className="text-[var(--purple)]" /> Agregar Producto
            </h2>
            <div className="space-y-4">
              <div className="field">
                <label className="text-xs font-bold text-slate-700">Nombre del Producto</label>
                <input 
                  type="text" 
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  placeholder="Ej. Manzanas"
                />
              </div>
              <div className="field">
                <label className="text-xs font-bold text-slate-700">Categoría</label>
                <select 
                  value={newProdCategory}
                  onChange={e => setNewProdCategory(e.target.value)}
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="field">
                  <label className="text-xs font-bold text-slate-700">Unidad de Medida</label>
                  <select value={newProdUnit} onChange={e => setNewProdUnit(e.target.value)}>
                    <option value="Kg">Kg</option>
                    <option value="Gramos">Gramos</option>
                    <option value="Litros">Litros</option>
                    <option value="Mililitros">Mililitros</option>
                    <option value="Unidades">Unidades</option>
                    <option value="Paquete">Paquete</option>
                  </select>
                </div>
                <div className="field">
                  <label className="text-xs font-bold text-slate-700">Precio Ref. ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="px-5 py-2 rounded-full font-bold text-sm text-slate-500 bg-white/50 border border-slate-300 hover:bg-white transition-colors" onClick={() => setShowAddProductModal(false)}>Cancelar</button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  if (newProdName && newProdCategory && newProdPrice) {
                    addCustomProduct({
                      nombre: newProdName,
                      grupo_nutricional: newProdCategory,
                      unidad_medida: newProdUnit,
                      precio_referencia_cendas: Number(newProdPrice),
                      categoriaId: 1
                    });
                    setShowAddProductModal(false);
                    setNewProdName('');
                    setNewProdCategory('');
                    setNewProdPrice('');
                    setSearchQuery(newProdName);
                    setSearchCategory('');
                  }
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
