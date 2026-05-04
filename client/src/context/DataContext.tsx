import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const CAT_META: Record<string, { label: string; emoji: string; color: string }> = {
  alimentacion:   { label:'Alimentación',    emoji:'🛒', color:'#a78bfa' },
  transporte:     { label:'Transporte',      emoji:'🚗', color:'#fb923c' },
  salud:          { label:'Salud',           emoji:'💊', color:'#f472b6' },
  entretenimiento:{ label:'Entretenimiento', emoji:'🎬', color:'#60a5fa' },
  educacion:      { label:'Educación',       emoji:'📚', color:'#34d399' },
  hogar:          { label:'Hogar',           emoji:'🏠', color:'#818cf8' },
  ropa:           { label:'Ropa',            emoji:'👗', color:'#f9a8d4' },
  servicios:      { label:'Servicios',       emoji:'💡', color:'#fbbf24' },
  nomina:         { label:'Nómina',          emoji:'💼', color:'#6ee7b7' },
  freelance:      { label:'Freelance',       emoji:'💻', color:'#7dd3fc' },
  inversiones:    { label:'Inversiones',     emoji:'📈', color:'#86efac' },
  otros:          { label:'Otros',           emoji:'📦', color:'#cbd5e1' },
};

export const ACC_TYPE_LABELS: Record<string, string> = { checking:'Corriente', savings:'Ahorro', cash:'Efectivo', investment:'Inversión', credit:'Crédito' };

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  desc: string;
  amount: number;
  date: string;
  category: string;
  account: string;
  note: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

interface DataContextType {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  addTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;
  addBudget: (bud: Budget) => void;
  deleteBudget: (id: string) => void;
  fmt: (n: number) => string;
  fmtShort: (n: number) => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5);

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    let storedData = JSON.parse(localStorage.getItem('finflow_react_data') || 'null');
    
    if (!storedData) {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      const f = (d: Date) => d.toISOString().slice(0,10);
      
      const seedAccounts = [
        { id: genId(), name:'Cuenta Principal', type:'checking', balance:4250, color:'grad-purple' },
        { id: genId(), name:'Cuenta Ahorro',    type:'savings',  balance:8700, color:'grad-blue'   },
        { id: genId(), name:'Efectivo',         type:'cash',     balance:320,  color:'grad-teal'   },
      ];
      
      const seedTransactions: Transaction[] = [
        {id:genId(),type:'income', desc:'Nómina mayo',        amount:3200,  date:f(new Date(y,m,1)),  category:'nomina',          account:seedAccounts[0].id, note:''},
        {id:genId(),type:'expense',desc:'Supermercado',       amount:185,   date:f(new Date(y,m,3)),  category:'alimentacion',    account:seedAccounts[0].id, note:''},
        {id:genId(),type:'expense',desc:'Netflix',            amount:15.99, date:f(new Date(y,m,5)),  category:'entretenimiento', account:seedAccounts[0].id, note:''},
        {id:genId(),type:'income', desc:'Proyecto freelance', amount:750,   date:f(new Date(y,m,8)),  category:'freelance',       account:seedAccounts[0].id, note:''},
        {id:genId(),type:'expense',desc:'Gasolina',           amount:60,    date:f(new Date(y,m,10)), category:'transporte',      account:seedAccounts[2].id, note:''},
      ];

      const seedBudgets = [
        {id:genId(),category:'alimentacion',    limit:400},
        {id:genId(),category:'entretenimiento', limit:100},
      ];

      setAccounts(seedAccounts);
      setTransactions(seedTransactions);
      setBudgets(seedBudgets);
    } else {
      setAccounts(storedData.accounts || []);
      setTransactions(storedData.transactions || []);
      setBudgets(storedData.budgets || []);
    }
  }, []);

  useEffect(() => {
    if (accounts.length > 0 || transactions.length > 0 || budgets.length > 0) {
      localStorage.setItem('finflow_react_data', JSON.stringify({ accounts, transactions, budgets }));
    }
  }, [accounts, transactions, budgets]);

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
    setAccounts(prev => prev.map(a => {
      if (a.id === tx.account) {
        if (tx.type === 'income') return { ...a, balance: a.balance + tx.amount };
        if (tx.type === 'expense') return { ...a, balance: a.balance - tx.amount };
      }
      return a;
    }));
  };

  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
  const addAccount = (acc: Account) => setAccounts(prev => [...prev, acc]);
  const deleteAccount = (id: string) => setAccounts(prev => prev.filter(a => a.id !== id));
  const addBudget = (bud: Budget) => setBudgets(prev => [...prev, bud]);
  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(b => b.id !== id));

  const fmt = (n: number) => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtShort = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toFixed(0);

  return (
    <DataContext.Provider value={{ transactions, accounts, budgets, addTransaction, deleteTransaction, addAccount, deleteAccount, addBudget, deleteBudget, fmt, fmtShort }}>
      {children}
    </DataContext.Provider>
  );
}
