import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export function Modals({
  showTxModal, setShowTxModal,
  showAccModal, setShowAccModal,
  showBudModal, setShowBudModal
}: any) {
  const { accounts, budgets, addTransaction, addAccount, addBudget } = useData();

  // Transaction Modal State
  const [txType, setTxType] = useState<'income' | 'expense' | 'transfer'>('expense');

  const handleTxSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));
    if (amount <= 0) return;

    addTransaction({
      id: Date.now().toString(),
      type: txType,
      desc: formData.get('desc') as string,
      amount,
      date: formData.get('date') as string,
      category: formData.get('category') as string,
      account: formData.get('account') as string,
      note: formData.get('note') as string,
    });
    setShowTxModal(false);
  };

  const handleAccSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const balance = Number(formData.get('balance'));

    addAccount({
      id: Date.now().toString(),
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      balance,
      color: formData.get('color') as string,
    });
    setShowAccModal(false);
  };

  const handleBudSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const limit = Number(formData.get('limit'));
    const category = formData.get('category') as string;

    if (budgets.some(b => b.category === category)) {
      alert('Ya existe un presupuesto para esta categoría');
      return;
    }

    addBudget({
      id: Date.now().toString(),
      category,
      limit,
    });
    setShowBudModal(false);
  };

  return (
    <>
      {/* TX MODAL */}
      {showTxModal && (
        <div className="overlay show" onClick={(e) => e.target === e.currentTarget && setShowTxModal(false)}>
          <div className="modal">
            <div className="modal-title">✨ Nueva Transacción</div>
            <div className="tabs" style={{ marginBottom: '1.1rem' }}>
              <div className={`tab ${txType === 'expense' ? 'active' : ''}`} onClick={() => setTxType('expense')}>💸 Gasto</div>
              <div className={`tab ${txType === 'income' ? 'active' : ''}`} onClick={() => setTxType('income')}>💰 Ingreso</div>
              <div className={`tab ${txType === 'transfer' ? 'active' : ''}`} onClick={() => setTxType('transfer')}>🔄 Transfer</div>
            </div>
            <form onSubmit={handleTxSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
              <div className="field"><label>Descripción *</label><input type="text" name="desc" required placeholder="Ej: Supermercado, Nómina..." /></div>
              <div className="form-grid">
                <div className="field"><label>Monto *</label><input type="number" name="amount" required placeholder="0.00" min="0" step="0.01" /></div>
                <div className="field"><label>Fecha *</label><input type="date" name="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>Categoría</label>
                  <select name="category">
                    <option value="alimentacion">🛒 Alimentación</option>
                    <option value="transporte">🚗 Transporte</option>
                    <option value="salud">💊 Salud</option>
                    <option value="entretenimiento">🎬 Entretenimiento</option>
                    <option value="educacion">📚 Educación</option>
                    <option value="hogar">🏠 Hogar</option>
                    <option value="ropa">👗 Ropa</option>
                    <option value="servicios">💡 Servicios</option>
                    <option value="nomina">💼 Nómina</option>
                    <option value="freelance">💻 Freelance</option>
                    <option value="inversiones">📈 Inversiones</option>
                    <option value="otros">📦 Otros</option>
                  </select>
                </div>
                <div className="field"><label>Cuenta</label>
                  <select name="account">
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="field"><label>Nota</label><input type="text" name="note" placeholder="Comentario adicional..." /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowTxModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">💾 Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACC MODAL */}
      {showAccModal && (
        <div className="overlay show" onClick={(e) => e.target === e.currentTarget && setShowAccModal(false)}>
          <div className="modal">
            <div className="modal-title">💳 Nueva Cuenta</div>
            <form onSubmit={handleAccSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
              <div className="field"><label>Nombre *</label><input type="text" name="name" required placeholder="Ej: Cuenta Principal" /></div>
              <div className="form-grid">
                <div className="field"><label>Tipo</label>
                  <select name="type">
                    <option value="checking">Cuenta Corriente</option>
                    <option value="savings">Cuenta Ahorro</option>
                    <option value="cash">Efectivo</option>
                    <option value="investment">Inversión</option>
                    <option value="credit">Crédito</option>
                  </select>
                </div>
                <div className="field"><label>Saldo inicial *</label><input type="number" name="balance" required placeholder="0.00" min="0" step="0.01" /></div>
              </div>
              <div className="field"><label>Color de tarjeta</label>
                <select name="color">
                  <option value="grad-purple">💜 Morado</option>
                  <option value="grad-pink">💗 Rosa</option>
                  <option value="grad-blue">💙 Azul</option>
                  <option value="grad-teal">💚 Verde</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAccModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BUD MODAL */}
      {showBudModal && (
        <div className="overlay show" onClick={(e) => e.target === e.currentTarget && setShowBudModal(false)}>
          <div className="modal">
            <div className="modal-title">🎯 Nuevo Presupuesto</div>
            <form onSubmit={handleBudSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
              <div className="field"><label>Categoría *</label>
                <select name="category">
                  <option value="alimentacion">🛒 Alimentación</option>
                  <option value="transporte">🚗 Transporte</option>
                  <option value="salud">💊 Salud</option>
                  <option value="entretenimiento">🎬 Entretenimiento</option>
                  <option value="educacion">📚 Educación</option>
                  <option value="hogar">🏠 Hogar</option>
                  <option value="ropa">👗 Ropa</option>
                  <option value="servicios">💡 Servicios</option>
                  <option value="otros">📦 Otros</option>
                </select>
              </div>
              <div className="field"><label>Límite mensual (USD) *</label><input type="number" name="limit" required placeholder="0.00" min="0.01" step="0.01" /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowBudModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear presupuesto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
