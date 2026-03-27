import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast'; // <-- Adicionado para notificações premium
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Mudamos o nome do estado de 'user' para 'auth' para bater exatamente com o que o Header espera
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();

  // CORREÇÃO 1: Movemos o logout para cima, antes do useEffect!
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('escola_username'); // <-- Limpa o nome salvo ao sair
    setAuth(null);
    navigate('/');
  };

  useEffect(() => {
    // Ao carregar a página, verifica se já existe um token e um usuário salvos
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('escola_username'); // <-- Recupera o nome

    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Injeta o username dentro do estado global junto com os dados do token
        setAuth({ ...decoded, username });
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
      localStorage.setItem('escola_username', username); // <-- Armazena o nome do usuário
      
      const decoded = jwtDecode(access);
      setAuth({ ...decoded, username }); // Atualiza o estado com o token decodificado + nome
      
      // Redireciona para o painel principal após o login
      navigate('/dashboard'); 
    } catch (error) {
      console.error("Erro no login", error);
      toast.error('Credenciais inválidas. Tente novamente.'); // <-- Trocamos o alert pelo toast!
      throw error; // Lança o erro para o Login.jsx parar a animação do botão
    }
  };

  return (
    // Passamos o 'auth' no value, que é o que o Header.jsx está esperando
    <AuthContext.Provider value={{ auth, login, logout }}>
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