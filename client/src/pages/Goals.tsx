import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Target, Calendar, TrendingUp, X, Trophy, Check } from 'lucide-react';
import { Goal } from '../types';

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
      nombre: '',
      monto_objetivo: 0,
      monto_actual: 0,
      fecha_limite: ''
  });

  useEffect(() => {
     fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
        const res = await fetch('http://localhost:3000/goals');
        const data = await res.json();
        setGoals(data);
    } catch (error) {
        console.error("Error fetching goals", error);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const url = editingId 
              ? `http://localhost:3000/goals/${editingId}` 
              : 'http://localhost:3000/goals';
          const method = editingId ? 'PUT' : 'POST';

          const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...formData,
                  monto_objetivo: Number(formData.monto_objetivo),
                  monto_actual: Number(formData.monto_actual)
              })
          });

          if (res.ok) {
              fetchGoals();
              setIsModalOpen(false);
              resetForm();
          }
      } catch (error) {
          console.error("Error saving goal", error);
      }
  };

  const handleDelete = async (id: number) => {
      if (!confirm('¿Eliminar esta meta?')) return;
      try {
          await fetch(`http://localhost:3000/goals/${id}`, { method: 'DELETE' });
          setGoals(goals.filter(g => g.id !== id));
      } catch (error) {
          console.error("Error deleting goal", error);
      }
  };

  const openEdit = (g: Goal) => {
      setEditingId(g.id);
      setFormData({
          nombre: g.nombre,
          monto_objetivo: g.monto_objetivo,
          monto_actual: g.monto_actual,
          fecha_limite: g.fecha_limite ? g.fecha_limite.split('T')[0] : ''
      });
      setIsModalOpen(true);
  };

  const resetForm = () => {
      setEditingId(null);
      setFormData({
          nombre: '',
          monto_objetivo: 0,
          monto_actual: 0,
          fecha_limite: ''
      });
  };

  if (loading) return <div className="p-8 text-center">Cargando metas...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
         <div>
          <h1 className="text-3xl font-bold text-gray-800">Metas de Ahorro</h1>
          <p className="text-gray-600">Visualiza y alcanza tus sueños</p>
        </div>
        <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="btn-primary"
        >
          <Plus size={20} />
          Nueva Meta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
              const percentage = Math.min((goal.monto_actual / goal.monto_objetivo) * 100, 100);
              const isCompleted = percentage >= 100;

              return (
                  <div key={goal.id} className="card relative group hover:shadow-lg transition-all overflow-hidden">
                      {/* Background Accents */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                      
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button onClick={() => openEdit(goal)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(goal.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>

                      <div className="relative z-10 mb-6 flex items-start justify-between">
                          <div className={`p-3 rounded-2xl shadow-sm ${isCompleted ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                              {isCompleted ? <Trophy size={24} /> : <Target size={24} />}
                          </div>
                      </div>

                      <div className="relative z-10">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{goal.nombre}</h3>
                          {goal.fecha_limite && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                                  <Calendar size={12} />
                                  <span>Meta: {new Date(goal.fecha_limite).toLocaleDateString()}</span>
                              </div>
                          )}

                          <div className="flex items-end justify-between mb-2">
                             <div>
                                 <p className="text-sm font-medium text-gray-500">Ahorrado</p>
                                 <p className="text-2xl font-black text-gray-800">${Number(goal.monto_actual).toLocaleString()}</p>
                             </div>
                             <div className="text-right">
                                 <p className="text-xs font-bold text-gray-400">Objetivo</p>
                                 <p className="text-sm font-bold text-gray-600">${Number(goal.monto_objetivo).toLocaleString()}</p>
                             </div>
                          </div>

                          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-0.5">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 relative ${isCompleted ? 'bg-yellow-400' : 'bg-blue-500'}`}
                                style={{ width: `${percentage}%` }}
                              >
                                  <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-l from-white/30 to-transparent"></div>
                              </div>
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center text-xs font-medium">
                              <span className={isCompleted ? 'text-yellow-600' : 'text-blue-600'}>{percentage.toFixed(0)}% Completado</span>
                              {isCompleted ? (
                                  <span className="flex items-center gap-1 text-green-600"><Check size={14} /> ¡Logrado!</span>
                              ) : (
                                  <span className="flex items-center gap-1 text-gray-400"><TrendingUp size={14} /> Sigue así</span>
                              )}
                          </div>
                          
                          {/* Quick Add Button */}
                          {!isCompleted && (
                              <button 
                                onClick={() => openEdit(goal)} 
                                className="w-full mt-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
                              >
                                  + Agregar Fondos
                              </button>
                          )}
                      </div>
                  </div>
              );
          })}

          {goals.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
                 <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Target size={32} className="text-blue-300" />
                 </div>
                 <p className="font-medium">No tienes metas activas.</p>
                 <button onClick={() => setIsModalOpen(true)} className="text-blue-600 font-bold mt-2 hover:underline">
                     Definir mi primer objetivo
                 </button>
             </div>
          )}
      </div>

      {/* Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Editar Meta' : 'Nueva Meta'}</h2>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Meta</label>
                          <input 
                              type="text" 
                              required
                              autoFocus
                              value={formData.nombre}
                              onChange={e => setFormData({...formData, nombre: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none"
                              placeholder="Ej. Vacaciones Europa"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Monto Objetivo</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                              <input 
                                  type="number" 
                                  required
                                  value={formData.monto_objetivo || ''}
                                  onChange={e => setFormData({...formData, monto_objetivo: Number(e.target.value)})}
                                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none font-bold"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ahorro Actual</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                              <input 
                                  type="number" 
                                  value={formData.monto_actual}
                                  onChange={e => setFormData({...formData, monto_actual: Number(e.target.value)})}
                                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite (Opcional)</label>
                          <input 
                              type="date" 
                              value={formData.fecha_limite}
                              onChange={e => setFormData({...formData, fecha_limite: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none"
                          />
                      </div>

                      <button type="submit" className="w-full btn-primary py-3 mt-4">
                          {editingId ? 'Guardar Cambios' : 'Crear Meta'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
