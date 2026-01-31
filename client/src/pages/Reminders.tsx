import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Bell, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { Reminder } from '../types';

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
      titulo: '',
      descripcion: '',
      monto_estimado: '',
      fecha_recordatorio: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
        const res = await fetch('http://localhost:3000/reminders');
        const data = await res.json();
        setReminders(data);
    } catch (error) {
        console.error("Error fetching reminders", error);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await fetch('http://localhost:3000/reminders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
          });

          if (res.ok) {
              fetchReminders();
              setIsModalOpen(false);
              setFormData({
                  titulo: '',
                  descripcion: '',
                  monto_estimado: '',
                  fecha_recordatorio: new Date().toISOString().split('T')[0]
              });
          }
      } catch (error) {
          console.error("Error creating reminder", error);
      }
  };

  const handleDelete = async (id: number) => {
      if(!confirm('¿Borrar recordatorio?')) return;
      await fetch(`http://localhost:3000/reminders/${id}`, { method: 'DELETE' });
      setReminders(reminders.filter(r => r.id !== id));
  };

  const handleMarkAsRead = async (id: number) => {
      await fetch(`http://localhost:3000/reminders/${id}/read`, { method: 'PUT' });
      setReminders(reminders.map(r => r.id === id ? { ...r, is_read: true } : r));
  };

  if (loading) return <div className="p-8 text-center">Cargando recordatorios...</div>;

  const activeReminders = reminders.filter(r => !r.is_read);
  const completedReminders = reminders.filter(r => r.is_read);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Recordatorios</h1>
          <p className="text-gray-600">No olvides tus pagos importantes</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
        >
          <Plus size={20} />
          Nuevo Recordatorio
        </button>
      </div>

      <div className="space-y-6">
          {/* Active Reminders */}
          <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                  Pendientes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeReminders.map(r => {
                      const daysUntil = Math.ceil((new Date(r.fecha_recordatorio).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const isUrgent = daysUntil <= 3;

                      return (
                          <div key={r.id} className={`card border-l-4 ${isUrgent ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                              <div className="flex justify-between items-start mb-4">
                                  <div className={`p-3 rounded-full ${isUrgent ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                      <Bell size={24} />
                                  </div>
                                  <div className="flex gap-1">
                                      <button onClick={() => handleMarkAsRead(r.id)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg" title="Marcar completado">
                                          <CheckCircle2 size={20} />
                                      </button>
                                      <button onClick={() => handleDelete(r.id)} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg">
                                          <Trash2 size={20} />
                                      </button>
                                  </div>
                              </div>
                              
                              <h3 className="font-bold text-gray-800 text-lg mb-1">{r.titulo}</h3>
                              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{r.descripcion || 'Sin descripción'}</p>
                              
                              <div className={`flex items-center gap-2 text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-gray-500'}`}>
                                  {isUrgent ? <AlertTriangle size={16} /> : <Calendar size={16} />}
                                  <span>Vence: {new Date(r.fecha_recordatorio).toLocaleDateString()}</span>
                                  {isUrgent && <span className="text-xs bg-red-100 px-2 py-0.5 rounded ml-auto">¡Urgente!</span>}
                              </div>
                              {r.monto_estimado && <p className="text-sm font-bold text-gray-700 mt-2">${Number(r.monto_estimado).toLocaleString()}</p>}
                          </div>
                      );
                  })}
                  {activeReminders.length === 0 && (
                      <div className="col-span-full py-8 text-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                          <CheckCircle2 size={40} className="mx-auto mb-2 text-green-400" />
                          <p>¡Todo al día! No tienes recordatorios pendientes.</p>
                      </div>
                  )}
              </div>
          </div>

          {/* Completed Reminders */}
          {completedReminders.length > 0 && (
              <div>
                  <h2 className="text-lg font-bold text-gray-500 mb-4 flex items-center gap-2 opacity-75">
                      <div className="w-2 h-6 bg-gray-300 rounded-full"></div>
                      Completados Recientemente
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity">
                      {completedReminders.map(r => (
                          <div key={r.id} className="card bg-gray-50">
                              <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-bold text-gray-700 decoration-slate-400 line-through">{r.titulo}</h3>
                                  <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-500">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                              <p className="text-xs text-gray-500">Completado</p>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Nuevo Recordatorio</h2>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                          <input 
                              type="text" 
                              required
                              autoFocus
                              value={formData.titulo}
                              onChange={e => setFormData({...formData, titulo: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none"
                              placeholder="Ej. Pagar tarjeta crédito"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Monto Estimado</label>
                          <input 
                              type="number" 
                              value={formData.monto_estimado}
                              onChange={e => setFormData({...formData, monto_estimado: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none"
                              placeholder="0.00"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Vencimiento</label>
                          <input 
                              type="date" 
                              required
                              value={formData.fecha_recordatorio}
                              onChange={e => setFormData({...formData, fecha_recordatorio: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                          <textarea 
                              value={formData.descripcion}
                              onChange={e => setFormData({...formData, descripcion: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none h-24 resize-none"
                              placeholder="Detalles adicionales..."
                          />
                      </div>

                      <button type="submit" className="w-full btn-primary py-3 mt-4">
                          Crear Recordatorio
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
