import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import SavingsPage from './pages/SavingsPage';
import FixedExpensesPage from './pages/FixedExpensesPage';
import BasketPage from './pages/BasketPage';
import SubstitutionsPage from './pages/SubstitutionsPage';
import ReportPage from './pages/ReportPage';
import UserSettingsPage from './pages/UserSettingsPage';
import Login from './pages/Login';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { DecisionSupportProvider } from './context/DecisionSupportContext';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center text-slate-500 font-bold text-xs bg-slate-50">
        Cargando FinFlow...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <DecisionSupportProvider>
      <Layout activePage={activePage} setActivePage={setActivePage}>
        {activePage === 'dashboard'      && <Dashboard />}
        {activePage === 'savings'        && <SavingsPage />}
        {activePage === 'fixed-expenses' && <FixedExpensesPage />}
        {activePage === 'basket'         && <BasketPage />}
        {activePage === 'substitutions'  && <SubstitutionsPage />}
        {activePage === 'report'         && <ReportPage />}
        {activePage === 'user-settings'  && <UserSettingsPage />}
      </Layout>
    </DecisionSupportProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;

