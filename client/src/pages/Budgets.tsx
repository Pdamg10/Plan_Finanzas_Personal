import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, PieChart, AlertCircle, X } from 'lucide-react';
import { Budget, Category, Transaction } from '../types';

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
      nombre: '',
      monto_maximo: 0,
      periodo: 'mensual',
      categoriaId: ''
  });

  useEffect(() => {
    Promise.all([
        fetch('http://localhost:3000/budgets').then(res => res.json()),
        fetch('http://localhost:3000/categories').then(res => res.json()),
        fetch('http://localhost:3000/transactions').then(res => res.json())
    ]).then(([buds, cats, trxs]) => {
        setBudgets(buds);
        setCategories(cats);
        setTransactions(trxs);
        setLoading(false);
    }).catch(err => {
        console.error(err);
        setLoading(false);
    });
  }, []);

  const calculateProgress = (categoryId: number, limit: number) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const spent = transactions
        .filter(t => {
            const d = new Date(t.fecha);
            return t.tipo === 'gasto' && 
                   t.categoriaId === categoryId &&
                   d.getMonth() === currentMonth &&
                   d.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + Number(t.monto), 0);

      const percentage = Math.min((spent / limit) * 100, 100);
      return { spent, percentage };
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const url = editingId 
              ? `http://localhost:3000/budgets/${editingId}` 
              : 'http://localhost:3000/budgets';
          const method = editingId ? 'PUT' : 'POST';

          const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...formData,
                  monto_maximo: Number(formData.monto_maximo),
                  categoriaId: Number(formData.categoriaId)
              })
          });

          if (res.ok) {
              const updated = await fetch('http://localhost:3000/budgets').then(r => r.json());
              setBudgets(updated);
              setIsModalOpen(false);
              resetForm();
          }
      } catch (error) {
          console.error("Error saving budget", error);
      }
  };

  const handleDelete = async (id: number) => {
      if (!confirm('¿Eliminar este presupuesto?')) return;
      try {
          await fetch(`http://localhost:3000/budgets/${id}`, { method: 'DELETE' });
          setBudgets(budgets.filter(b => b.id !== id));
      } catch (error) {
          console.error("Error deleting budget", error);
      }
  };

  const openEdit = (b: Budget) => {
      setEditingId(b.id);
      setFormData({
          nombre: b.nombre,
          monto_maximo: b.monto_maximo,
          periodo: b.periodo,
          categoriaId: String(b.categoriaId)
      });
      setIsModalOpen(true);
  };

  const resetForm = () => {
      setEditingId(null);
      setFormData({
          nombre: '',
          monto_maximo: 0,
          periodo: 'mensual',
          categoriaId: ''
      });
  };

  if (loading) return <div className="p-8 text-center">Cargando presupuestos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Presupuestos</h1>
          <p className="text-gray-600">Controla tus límites de gasto mensual</p>
        </div>
        <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="btn-primary"
        >
          <Plus size={20} />
          Nuevo Presupuesto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgets.map(budget => {
              const { spent, percentage } = calculateProgress(budget.categoriaId, budget.monto_maximo);
              const isOverLimit = spent > budget.monto_maximo;
              const category = categories.find(c => c.id === budget.categoriaId);

              return (
                  <div key={budget.id} className="card relative group hover:shadow-lg transition-all">
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(budget)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(budget.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm ${category?.color || 'bg-gray-400'}`}>
                              <PieChart size={24} />
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-800">{budget.nombre}</h3>
                              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-lg capitalize">{budget.periodo}</span>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <div className="flex justify-between items-end">
                              <div>
                                  <p className="text-2xl font-black text-gray-800">${spent.toLocaleString()}</p>
                                  <p className="text-xs text-gray-400 font-medium">Gastado</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-sm font-bold text-gray-600">de ${Number(budget.monto_maximo).toLocaleString()}</p>
                                  <p className="text-xs text-gray-400 font-medium">Límite</p>
                              </div>
                          </div>

                          <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                                      isOverLimit ? 'bg-red-500' : (percentage > 80 ? 'bg-orange-500' : 'bg-green-500')
                                  }`} 
                                  style={{ width: `${percentage}%` }}
                              ></div>
                          </div>

                          {isOverLimit ? (
                              <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-2 rounded-lg">
                                  <AlertCircle size={14} />
                                  <span>Has excedido tu límite por ${(spent - budget.monto_maximo).toLocaleString()}</span>
                              </div>
                          ) : (
                              <div className="flex justify-between text-xs text-gray-500 font-medium">
                                  <span>{percentage.toFixed(0)}% Utilizado</span>
                                  <span className="text-green-600">${(budget.monto_maximo - spent).toLocaleString()} Disponible</span>
                              </div>
                          )}
                      </div>
                  </div>
              );
          })}

          {budgets.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <PieChart size={32} className="text-gray-300" />
                 </div>
                 <p className="font-medium">No tienes presupuestos activos.</p>
                 <button onClick={() => setIsModalOpen(true)} className="text-[#ff4757] font-bold mt-2 hover:underline">
                     Crear mi primer presupuesto
                 </button>
             </div>
          )}
      </div>

      {/* Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</h2>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                          <input 
                              type="text" 
                              required
                              autoFocus
                              value={formData.nombre}
                              onChange={e => setFormData({...formData, nombre: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none"
                              placeholder="Ej. Comida Mensual"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Monto Límite</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                              <input 
                                  type="number" 
                                  required
                                  value={formData.monto_maximo || ''}
                                  onChange={e => setFormData({...formData, monto_maximo: Number(e.target.value)})}
                                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none font-bold"
                              />
                          </div>
                      </div>

                      <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                           <select 
                               required
                               value={formData.categoriaId}
                               onChange={e => setFormData({...formData, categoriaId: e.target.value})}
                               className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none bg-white"
                           >
                               <option value="">Seleccionar Categoría</option>
                               {categories.filter(c => c.tipo === 'gasto').map(c => (
                                   <option key={c.id} value={c.id}>{c.nombre}</option>
                               ))}
                           </select>
                      </div>

                      <button type="submit" className="w-full btn-primary py-3 mt-4">
                          {editingId ? 'Guardar Cambios' : 'Crear Presupuesto'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
