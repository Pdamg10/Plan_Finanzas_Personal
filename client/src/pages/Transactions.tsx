import { useState, useEffect } from 'react';
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, Edit2, Trash2, X } from 'lucide-react';
import { Transaction, Account, Category } from '../types';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, ingreso, gasto

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    monto: 0,
    tipo: 'gasto',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    cuentaId: '',
    categoriaId: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
        fetch('http://localhost:3000/transactions', { headers }).then(res => res.json()),
        fetch('http://localhost:3000/accounts', { headers }).then(res => res.json()),
        fetch('http://localhost:3000/categories', { headers }).then(res => res.json())
    ]).then(([trxs, accs, cats]) => {
        setTransactions(Array.isArray(trxs) ? trxs : []);
        setAccounts(Array.isArray(accs) ? accs : []);
        setCategories(Array.isArray(cats) ? cats : []);
        setLoading(false);
    }).catch(err => {
        console.error(err);
        setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const url = editingId 
            ? `http://localhost:3000/transactions/${editingId}`
            : 'http://localhost:3000/transactions';
          
          const method = editingId ? 'PUT' : 'POST';
          const token = localStorage.getItem('token');
          
          const payload = {
              ...formData,
              monto: Number(formData.monto),
              cuentaId: Number(formData.cuentaId),
              categoriaId: formData.categoriaId ? Number(formData.categoriaId) : null
          };

          const res = await fetch(url, {
              method,
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(payload)
          });

          if (res.ok) {
              const updated = await fetch('http://localhost:3000/transactions', { 
                  headers: { 'Authorization': `Bearer ${token}` } 
              }).then(r => r.json());
              setTransactions(updated);
              setIsModalOpen(false);
              resetForm();
          } else {
             const errData = await res.json();
             alert(`Error: ${errData.message || 'Error al guardar la transacción'}`);
          }
      } catch (error) {
          console.error("Error saving transaction", error);
          alert('Error de conexión.');
      }
  };

  const handleDelete = async (id: number) => {
      if(!confirm('¿Eliminar esta transacción?')) return;
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/transactions/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      setTransactions(transactions.filter(t => t.id !== id));
  };

  const resetForm = () => {
      setEditingId(null);
      setFormData({
        monto: 0,
        tipo: 'gasto',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        cuentaId: '',
        categoriaId: ''
      });
  };

  const openEdit = (t: Transaction) => {
      setEditingId(t.id);
      setFormData({
          monto: t.monto,
          tipo: t.tipo,
          descripcion: t.descripcion,
          fecha: t.fecha.split('T')[0],
          cuentaId: String(t.cuentaId),
          categoriaId: t.categoriaId ? String(t.categoriaId) : ''
      });
      setIsModalOpen(true);
  };

  // Filter Logic
  const filteredTransactions = transactions.filter(t => {
      const matchesSearch = t.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.tipo === filterType;
      return matchesSearch && matchesType;
  });

  if (loading) return <div className="p-8 text-center">Cargando transacciones...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transacciones</h1>
          <p className="text-gray-600">Registro detallado de movimientos</p>
        </div>
        <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="btn-primary"
        >
            <Plus size={20} />
            Nueva Transacción
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff4757]/20 text-gray-800"
              />
          </div>
          
          <div className="flex gap-2">
              {['all', 'ingreso', 'gasto'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        filterType === type 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                      {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
              ))}
          </div>
      </div>

      {/* Transactions List */}
      <div className="card overflow-hidden !p-0">
          <table className="w-full">
              <thead className="bg-gray-50/50">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Transacción</th>
                      <th className="px-6 py-4">Categoría</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4 text-right">Monto</th>
                      <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      t.tipo === 'ingreso' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                                  }`}>
                                      {t.tipo === 'ingreso' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                  </div>
                                  <div>
                                      <p className="font-bold text-gray-800">{t.descripcion}</p>
                                      <p className="text-xs text-gray-500">{accounts.find(a => a.id === t.cuentaId)?.nombre || 'Cuenta Desconocida'}</p>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                                  {categories.find(c => c.id === t.categoriaId)?.nombre || 'General'}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(t.fecha).toLocaleDateString()}
                          </td>
                          <td className={`px-6 py-4 text-right font-bold ${
                              t.tipo === 'ingreso' ? 'text-green-600' : 'text-gray-800'
                          }`}>
                              {t.tipo === 'ingreso' ? '+' : '-'}${Number(t.monto).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openEdit(t)} className="p-2 hover:bg-white rounded-lg text-blue-500 transition-colors"><Edit2 size={16} /></button>
                                  <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-white rounded-lg text-red-500 transition-colors"><Trash2 size={16} /></button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
          {filteredTransactions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                  No se encontraron transacciones.
              </div>
          )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Editar Transacción' : 'Nueva Transacción'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Type Selection */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
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
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          placeholder="0.00"
                          value={formData.monto === 0 ? '' : formData.monto}
                          onChange={e => setFormData({...formData, monto: e.target.value === '' ? 0 : Number(e.target.value)})}
                          className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#ff4757] outline-none font-bold text-lg placeholder:text-gray-300"
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input 
                      type="date" 
                      required
                      value={formData.fecha}
                      onChange={e => setFormData({...formData, fecha: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#ff4757] outline-none"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input 
                  type="text" 
                  required
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#ff4757] outline-none"
                  placeholder="Ej. Compras del supermercado"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
                    <select 
                      required
                      value={formData.cuentaId}
                      onChange={e => setFormData({...formData, cuentaId: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#ff4757] outline-none"
                    >
                        <option value="">Seleccionar</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.nombre} ({acc.moneda})</option>
                        ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select 
                      value={formData.categoriaId}
                      onChange={e => setFormData({...formData, categoriaId: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#ff4757] outline-none"
                    >
                        <option value="">Sin categoría</option>
                        {categories.filter(c => c.tipo === formData.tipo).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                 </div>
              </div>

              <button type="submit" className={`w-full py-4 rounded-xl font-bold text-white shadow-lg mt-4 transition-all hover:scale-[1.02] ${
                  formData.tipo === 'gasto' ? 'bg-[#ff4757] shadow-red-500/30' : 'bg-green-500 shadow-green-500/30'
              }`}>
                {editingId ? 'Guardar Cambios' : (formData.tipo === 'gasto' ? 'Registrar Gasto' : 'Registrar Ingreso')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
