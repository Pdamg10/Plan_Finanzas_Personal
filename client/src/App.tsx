import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { useState } from 'react';

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <AuthProvider>
      <Layout onNewTransaction={() => setShowModal(true)}>
        <Dashboard showModal={showModal} setShowModal={setShowModal} />
      </Layout>
    </AuthProvider>
  );
}

export default App;
