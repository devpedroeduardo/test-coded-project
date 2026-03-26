import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AtividadeDetalhes from './pages/AtividadeDetalhes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* A rota precisa estar exatamente assim, dentro do bloco <Routes> */}
          <Route path="/atividade/:id" element={<AtividadeDetalhes />} /> 
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;