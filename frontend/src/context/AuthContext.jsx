import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // <-- IMPORTANTE: A biblioteca que instalou
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Quando a aplicação carrega, verificamos se há um token guardado
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Descodifica o token para extrair o role e outros dados
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        
        // Injeta o token em todas as requisições futuras do Axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error("Token inválido ou expirado.");
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Faz a chamada ao Back-end (ajuste a rota se no seu Django for diferente)
    const response = await api.post('/auth/login/', { username, password });
    
    // O SimpleJWT do Django devolve 'access' e 'refresh'
    const { access } = response.data; 
    
    // Guarda o token e injeta no Axios
    localStorage.setItem('token', access);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    // Descodifica o token para sabermos NA HORA se é PROFESSOR ou ALUNO
    const decodedUser = jwtDecode(access);
    setUser(decodedUser);
    
    // Redireciona para o Dashboard
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);