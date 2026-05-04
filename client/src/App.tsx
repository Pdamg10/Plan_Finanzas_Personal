import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import AccountsPage from './pages/AccountsPage';
import BudgetsPage from './pages/BudgetsPage';
import ReportsPage from './pages/ReportsPage';
import Layout from './components/Layout';
import { Modals } from './components/Modals';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { useState } from 'react';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  
  // Modals state
  const [showTxModal, setShowTxModal] = useState(false);
  const [showAccModal, setShowAccModal] = useState(false);
  const [showBudModal, setShowBudModal] = useState(false);

  return (
    <AuthProvider>
      <DataProvider>
        <Layout activePage={activePage} setActivePage={setActivePage} setShowTxModal={setShowTxModal}>
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'transactions' && <TransactionsPage />}
        {activePage === 'accounts' && <AccountsPage showAccModal={showAccModal} setShowAccModal={setShowAccModal} />}
        {activePage === 'budgets' && <BudgetsPage showBudModal={showBudModal} setShowBudModal={setShowBudModal} />}
        {activePage === 'reports' && <ReportsPage />}
      </Layout>
      <Modals 
        showTxModal={showTxModal} setShowTxModal={setShowTxModal} 
        showAccModal={showAccModal} setShowAccModal={setShowAccModal}
        showBudModal={showBudModal} setShowBudModal={setShowBudModal}
      />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
