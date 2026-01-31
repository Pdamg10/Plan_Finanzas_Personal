import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Check, X } from 'lucide-react';
import { Category } from '../types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
      nombre: '',
      tipo: 'gasto', // gasto | ingreso
      color: 'bg-gray-500',
      icono: 'Tag'
  });

  const generateRandomColor = () => {
    const colors = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 
        'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
        'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
      try {
          const res = await fetch('http://localhost:3000/categories');
          const data = await res.json();
          setCategories(data);
      } catch (error) {
          console.error("Error fetching categories", error);
      } finally {
          setLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const url = editingId 
              ? `http://localhost:3000/categories/${editingId}` 
              : 'http://localhost:3000/categories';
          const method = editingId ? 'PUT' : 'POST';

          const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
          });

          if (res.ok) {
              fetchCategories();
              setIsModalOpen(false);
              resetForm();
          }
      } catch (error) {
          console.error("Error saving category", error);
      }
  };

  const handleDelete = async (id: number) => {
      if (!confirm('¿Eliminar esta categoría?')) return;
      try {
          await fetch(`http://localhost:3000/categories/${id}`, { method: 'DELETE' });
          fetchCategories();
      } catch (error) {
          console.error("Error deleting category", error);
      }
  };

  const openEdit = (c: Category) => {
      if (c.is_default) {
          alert("No puedes editar categorías por defecto.");
          return;
      }
      setEditingId(c.id);
      setFormData({
          nombre: c.nombre,
          tipo: c.tipo,
          color: c.color || 'bg-gray-500',
          icono: c.icono || 'Tag'
      });
      setIsModalOpen(true);
  };

  const resetForm = () => {
      setEditingId(null);
      setFormData({
          nombre: '',
          tipo: 'gasto',
          color: generateRandomColor(),
          icono: 'Tag'
      });
  };

  if (loading) return <div className="p-8 text-center">Cargando categorías...</div>;

  const incomeCategories = categories.filter(c => c.tipo === 'ingreso');
  const expenseCategories = categories.filter(c => c.tipo === 'gasto');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categorías</h1>
          <p className="text-gray-600">Personaliza cómo agrupas tus transacciones</p>
        </div>
        <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="btn-primary"
        >
          <Plus size={20} />
          Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Expense Categories */}
          <div className="card">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-red-500 rounded-full"></div>
                  Gastos
              </h3>
              <div className="space-y-2">
                  {expenseCategories.map(cat => (
                      <div key={cat.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                          <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${cat.color || 'bg-gray-400'}`}>
                                  <Tag size={18} />
                              </div>
                              <span className="font-medium text-gray-700">{cat.nombre}</span>
                              {cat.is_default && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">Default</span>}
                          </div>
                          {!cat.is_default && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openEdit(cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>

          {/* Income Categories */}
          <div className="card">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-green-500 rounded-full"></div>
                  Ingresos
              </h3>
              <div className="space-y-2">
                  {incomeCategories.map(cat => (
                      <div key={cat.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                          <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${cat.color || 'bg-gray-400'}`}>
                                  <Tag size={18} />
                              </div>
                              <span className="font-medium text-gray-700">{cat.nombre}</span>
                              {cat.is_default && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">Default</span>}
                          </div>
                          {!cat.is_default && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openEdit(cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
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
                              placeholder="Ej. Transporte"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                          <div className="flex bg-gray-100 p-1 rounded-xl">
                              {['gasto', 'ingreso'].map(type => (
                                  <button
                                      key={type}
                                      type="button"
                                      onClick={() => setFormData({...formData, tipo: type})}
                                      className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                                          formData.tipo === type 
                                          ? 'bg-white shadow-sm text-gray-800' 
                                          : 'text-gray-500 hover:text-gray-700'
                                      }`}
                                  >
                                      {type}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                           <div className="flex flex-wrap gap-2">
                               {[
                                   'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 
                                   'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
                                   'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500'
                               ].map(color => (
                                   <button
                                      key={color}
                                      type="button"
                                      onClick={() => setFormData({...formData, color})}
                                      className={`w-8 h-8 rounded-full ${color} transition-transform hover:scale-110 flex items-center justify-center ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                   >
                                       {formData.color === color && <Check size={14} className="text-white" />}
                                   </button>
                               ))}
                           </div>
                      </div>

                      <button type="submit" className="w-full btn-primary py-3 mt-4">
                          {editingId ? 'Guardar Cambios' : 'Crear Categoría'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
