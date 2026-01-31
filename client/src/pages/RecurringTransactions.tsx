import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, RefreshCw, X, Play } from 'lucide-react';
import { RecurringTransaction, Account, Category } from '../types';

export default function RecurringTransactions() {
  const [recurrings, setRecurrings] = useState<RecurringTransaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
      descripcion: '',
      monto: 0,
      tipo: 'gasto',
      frecuencia: 'mensual',
      fecha_inicio: new Date().toISOString().split('T')[0],
      cuentaId: '',
      categoriaId: '',
      active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const [recs, accs, cats] = await Promise.all([
            fetch('http://localhost:3000/recurring').then(res => res.json()),
            fetch('http://localhost:3000/accounts').then(res => res.json()),
            fetch('http://localhost:3000/categories').then(res => res.json())
        ]);
        setRecurrings(recs);
        setAccounts(accs);
        setCategories(cats);
        setLoading(false);
    } catch (error) {
        console.error("Error fetching data", error);
    } finally {
        setLoading(false);
    }
  };

  const calculateNextDate = (start: string, frequency: string, last?: string) => {
      const baseDate = last ? new Date(last) : new Date(start);
      // Logic purely for display - actual logic is backend
      const next = new Date(baseDate);
      if (frequency === 'mensual') next.setMonth(next.getMonth() + 1);
      if (frequency === 'semanal') next.setDate(next.getDate() + 7);
      if (frequency === 'anual') next.setFullYear(next.getFullYear() + 1);
      return next.toLocaleDateString();
  };

  const handleProcess = async () => {
      if(!confirm('¿Procesar transacciones pendientes ahora?')) return;
      setProcessing(true);
      try {
          await fetch('http://localhost:3000/recurring/process', { method: 'POST' });
          alert('Procesamiento completado. Revisa tus transacciones.');
          fetchData(); // Update last execution dates
      } catch (error) {
          console.error("Error processing", error);
      } finally {
          setProcessing(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const url = editingId 
              ? `http://localhost:3000/recurring/${editingId}` 
              : 'http://localhost:3000/recurring';
          const method = editingId ? 'PUT' : 'POST';

          const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...formData,
                  monto: Number(formData.monto),
                  cuentaId: Number(formData.cuentaId),
                  categoriaId: formData.categoriaId ? Number(formData.categoriaId) : null
              })
          });

          if (res.ok) {
              fetchData();
              setIsModalOpen(false);
              resetForm();
          }
      } catch (error) {
          console.error("Error saving recurring", error);
      }
  };

  const handleDelete = async (id: number) => {
     if (!confirm('¿Eliminar esta recurrencia?')) return;
     await fetch(`http://localhost:3000/recurring/${id}`, { method: 'DELETE' });
     setRecurrings(recurrings.filter(r => r.id !== id));
  };

  const openEdit = (r: RecurringTransaction) => {
      setEditingId(r.id);
      setFormData({
          descripcion: r.descripcion,
          monto: r.monto,
          tipo: r.tipo,
          frecuencia: r.frecuencia,
          fecha_inicio: r.fecha_inicio.split('T')[0],
          cuentaId: String(r.cuentaId),
          categoriaId: r.categoriaId ? String(r.categoriaId) : '',
          active: r.active
      });
      setIsModalOpen(true);
  };

  const resetForm = () => {
      setEditingId(null);
      setFormData({
          descripcion: '',
          monto: 0,
          tipo: 'gasto',
          frecuencia: 'mensual',
          fecha_inicio: new Date().toISOString().split('T')[0],
          cuentaId: '',
          categoriaId: '',
          active: true
      });
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Recurrentes</h1>
          <p className="text-gray-600">Suscripciones y pagos automáticos</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleProcess}
                disabled={processing}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 transition-colors flex items-center gap-2"
            >
               <Play size={18} />
               {processing ? 'Procesando...' : 'Ejecutar Ahora'}
            </button>
            <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="btn-primary"
            >
            <Plus size={20} />
            Nueva
            </button>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
          <table className="w-full">
              <thead className="bg-gray-50/50">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Descripción</th>
                      <th className="px-6 py-4">Frecuencia</th>
                      <th className="px-6 py-4">Monto</th>
                      <th className="px-6 py-4">Próximo Cobro</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                      <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {recurrings.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.tipo === 'gasto' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                                      <RefreshCw size={18} />
                                  </div>
                                  <div>
                                      <p className="font-bold text-gray-800">{r.descripcion}</p>
                                      <p className="text-xs text-gray-500">{accounts.find(a => a.id === r.cuentaId)?.nombre}</p>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4 capitalize text-sm text-gray-600">
                              {r.frecuencia}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-800">
                              ${Number(r.monto).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                  <Calendar size={14} />
                                  {calculateNextDate(r.fecha_inicio, r.frecuencia, r.ultima_ejecucion)}
                              </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${r.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                  {r.active ? 'Activo' : 'Pausado'}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                  <button onClick={() => openEdit(r)} className="p-2 hover:bg-white rounded-lg text-blue-500 transition-colors"><Edit2 size={16} /></button>
                                  <button onClick={() => handleDelete(r.id)} className="p-2 hover:bg-white rounded-lg text-red-500 transition-colors"><Trash2 size={16} /></button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
          {recurrings.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                  No hay transacciones recurrentes configuradas.
              </div>
          )}
      </div>

      {/* Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Editar Recurrencia' : 'Nueva Recurrencia'}</h2>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                      
                      <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                          {['gasto', 'ingreso'].map(type => (
                              <button
                                  key={type}
                                  type="button"
                                  onClick={() => setFormData({...formData, tipo: type})}
                                  className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                                      formData.tipo === type 
                                      ? (type === 'gasto' ? 'bg-white text-red-500 shadow-sm' : 'bg-white text-green-500 shadow-sm')
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                              >
                                  {type}
                              </button>
                          ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                              <input 
                                  type="number" 
                                  required
                                  value={formData.monto || ''}
                                  onChange={e => setFormData({...formData, monto: Number(e.target.value)})}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                              <select 
                                  value={formData.frecuencia}
                                  onChange={e => setFormData({...formData, frecuencia: e.target.value})}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none bg-white"
                              >
                                  <option value="semanal">Semanal</option>
                                  <option value="mensual">Mensual</option>
                                  <option value="anual">Anual</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                          <input 
                              type="text" 
                              required
                              value={formData.descripcion}
                              onChange={e => setFormData({...formData, descripcion: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none"
                              placeholder="Ej. Netflix, Gimnasio, Alquiler"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                              <input 
                                  type="date" 
                                  required
                                  value={formData.fecha_inicio}
                                  onChange={e => setFormData({...formData, fecha_inicio: e.target.value})}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none"
                              />
                          </div>
                          <div className="flex items-center pl-4 pt-6">
                              <label className="flex items-center gap-3 cursor-pointer">
                                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                  </div>
                                  <input 
                                      type="checkbox" 
                                      checked={formData.active}
                                      onChange={e => setFormData({...formData, active: e.target.checked})}
                                      className="hidden"
                                  />
                                  <span className="text-sm font-medium text-gray-700">{formData.active ? 'Activo' : 'Pausado'}</span>
                              </label>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
                              <select 
                                  required
                                  value={formData.cuentaId}
                                  onChange={e => setFormData({...formData, cuentaId: e.target.value})}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none bg-white"
                              >
                                  <option value="">Seleccionar</option>
                                  {accounts.map(acc => (
                                      <option key={acc.id} value={acc.id}>{acc.nombre}</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                              <select 
                                  value={formData.categoriaId}
                                  onChange={e => setFormData({...formData, categoriaId: e.target.value})}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none bg-white"
                              >
                                  <option value="">Sin categoría</option>
                                  {categories.filter(c => c.tipo === formData.tipo).map(cat => (
                                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                  ))}
                              </select>
                          </div>
                      </div>

                      <button type="submit" className="w-full btn-primary py-3 mt-4">
                          {editingId ? 'Guardar Cambios' : 'Crear Recurrencia'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
