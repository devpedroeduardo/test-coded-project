import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast'; // <-- 1. Importamos o Toaster
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AtividadeDetalhes from './pages/AtividadeDetalhes';

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* 2. Colocamos o Toaster aqui, para ele ficar disponível em todo o app */}
        <Toaster position="top-right" reverseOrder={false} /> 
        
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/atividade/:id" element={<AtividadeDetalhes />} /> 
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;