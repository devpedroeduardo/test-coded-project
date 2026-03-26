import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // CORREÇÃO 1: Movemos o logout para cima, antes do useEffect!
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    // Ao carregar a página, verifica se já existe um token salvo
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Token inválido ou expirado", error);
        logout();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      const { access } = response.data;
      
      localStorage.setItem('token', access); // Armazena o token
      
      const decoded = jwtDecode(access);
      setUser(decoded);
      
      // Redireciona para o painel principal após o login
      navigate('/dashboard'); 
    } catch (error) {
      console.error("Erro no login", error);
      alert('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// CORREÇÃO 2: Essa linha mágica desativa o alerta chato do Vite só para este Hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};