import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Login from './pages/Login';
import Reports from './pages/Reports';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import type { ReactNode } from 'react';
import Categories from './pages/Categories';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import RecurringTransactions from './pages/RecurringTransactions';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Navigate to="/" />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="categories" element={<Categories />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="goals" element={<Goals />} />
            <Route path="recurring" element={<RecurringTransactions />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
