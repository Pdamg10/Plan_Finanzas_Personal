import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowRightLeft, CreditCard, Wallet, Landmark, DollarSign, X } from 'lucide-react';
import { Account } from '../types';

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form States
  const [formData, setFormData] = useState({ nombre: '', tipo: 'banco', saldo_actual: 0, moneda: 'USD' });
  const [transferData, setTransferData] = useState({ originId: '', destId: '', amount: 0, description: 'Transferencia' });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/accounts', {
        headers: { 
            'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAccount 
        ? `http://localhost:3000/accounts/${editingAccount.id}`
        : 'http://localhost:3000/accounts';
      
      const method = editingAccount ? 'PUT' : 'POST';
      const token = localStorage.getItem('token');
      
      const res = await fetch(url, {
        method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingAccount(null);
        setFormData({ nombre: '', tipo: 'banco', saldo_actual: 0, moneda: 'USD' });
        fetchAccounts();
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message || 'Error al guardar la cuenta'}`);
      }
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Error de conexión al guardar.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/accounts/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferData.originId || !transferData.destId) return;

    try {
        const res = await fetch('http://localhost:3000/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                monto: transferData.amount,
                tipo: 'transferencia',
                descripcion: transferData.description,
                fecha: new Date().toISOString(),
                cuentaId: Number(transferData.originId),
                cuentaDestinoId: Number(transferData.destId)
            })
        });
        
        if (res.ok) {
            setIsTransferModalOpen(false);
            setTransferData({ originId: '', destId: '', amount: 0, description: 'Transferencia' });
            fetchAccounts(); // Refresh balances
        }
    } catch (error) {
        console.error("Transfer failed", error);
    }
  };

  const openEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({ 
        nombre: account.nombre, 
        tipo: account.tipo, 
        saldo_actual: account.saldo_actual, 
        moneda: account.moneda 
    });
    setIsModalOpen(true);
  };

  const getIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'efectivo': return <Wallet />;
      case 'credito': return <CreditCard />;
      case 'inversion': return <DollarSign />;
      default: return <Landmark />;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando cuentas...</div>;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cuentas</h1>
          <p className="text-gray-600">Gestiona tus fuentes de dinero</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setIsTransferModalOpen(true)}
                className="btn-secondary flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50"
            >
                <ArrowRightLeft size={18} />
                Transferir
            </button>
            <button 
                onClick={() => { setEditingAccount(null); setFormData({ nombre: '', tipo: 'banco', saldo_actual: 0, moneda: 'USD' }); setIsModalOpen(true); }}
                className="btn-primary"
            >
                <Plus size={20} />
                Nueva Cuenta
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="card relative group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button onClick={() => openEdit(acc)} className="p-2 bg-white/80 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(acc.id)} className="p-2 bg-white/80 rounded-lg text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 shadow-inner">
                {getIcon(acc.tipo)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">{acc.nombre}</h3>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{acc.tipo}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-500 text-sm mb-1">Saldo Actual</p>
              <h2 className="text-3xl font-black text-gray-800">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: acc.moneda }).format(acc.saldo_actual)}
              </h2>
            </div>
            
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-[#ff4757] w-full origin-left transform scale-x-100"></div>
            </div>
          </div>
        ))}
        
        {/* Add New Card Placeholder */}
        <button 
            onClick={() => { setEditingAccount(null); setFormData({ nombre: '', tipo: 'banco', saldo_actual: 0, moneda: 'USD' }); setIsModalOpen(true); }}
            className="border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-[#ff4757] hover:text-[#ff4757] hover:bg-red-50/50 transition-all min-h-[200px]"
        >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                <Plus size={32} />
            </div>
            <span className="font-bold">Agregar Nueva Cuenta</span>
        </button>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la cuenta</label>
                <input 
                  autoFocus
                  type="text" 
                  required
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                  placeholder="Ej. Banco Principal"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select 
                    value={formData.tipo}
                    onChange={e => setFormData({...formData, tipo: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                    >
                        <option value="banco">Banco</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="credito">Crédito</option>
                        <option value="inversion">Inversión</option>
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                     <select 
                        value={formData.moneda}
                        onChange={e => setFormData({...formData, moneda: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none"
                     >
                        <option value="USD">USD</option>
                        <option value="MXN">MXN</option>
                        <option value="EUR">EUR</option>
                     </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingAccount ? 'Ajustar Saldo' : 'Saldo Inicial'}
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={formData.saldo_actual === 0 ? '' : formData.saldo_actual}
                    onChange={e => setFormData({...formData, saldo_actual: e.target.value === '' ? 0 : Number(e.target.value)})}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-900 font-bold"
                    />
                </div>
                {editingAccount && <p className="text-xs text-orange-500 mt-1">⚠️ Cambiar esto actualizará el balance directamente.</p>}
              </div>

              <button type="submit" className="w-full btn-primary py-3 mt-4">
                {editingAccount ? 'Guardar Cambios' : 'Crear Cuenta'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Transferir Fondos</h2>
                <button onClick={() => setIsTransferModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 border border-gray-200 z-10 text-gray-400">
                        <ArrowRightLeft size={16} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">De (Origen)</label>
                        <select 
                            required
                            value={transferData.originId}
                            onChange={e => setTransferData({...transferData, originId: e.target.value})}
                            className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none text-sm"
                        >
                            <option value="">Seleccionar</option>
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">A (Destino)</label>
                        <select 
                            required
                            value={transferData.destId}
                            onChange={e => setTransferData({...transferData, destId: e.target.value})}
                            className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none text-sm"
                        >
                            <option value="">Seleccionar</option>
                            {accounts.filter(a => String(a.id) !== transferData.originId).map(acc => <option key={acc.id} value={acc.id}>{acc.nombre}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Transferir</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input 
                        type="number" 
                        step="0.01"
                        min="0.01"
                        required
                        value={transferData.amount || ''}
                        onChange={e => setTransferData({...transferData, amount: Number(e.target.value)})}
                        className="w-full pl-8 pr-4 py-4 text-2xl font-bold text-gray-800 rounded-xl border border-gray-200 focus:border-[#ff4757] focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                        placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                     <input 
                        type="text" 
                        value={transferData.description}
                        onChange={e => setTransferData({...transferData, description: e.target.value})}
                         className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4757] outline-none"
                     />
                </div>

                <button type="submit" className="w-full btn-primary py-3 mt-4">
                    Confirmar Transferencia
                </button>
            </form>
           </div>
        </div>
      )}
    </div>
  );
}
