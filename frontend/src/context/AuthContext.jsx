import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        return jwtDecode(token);
      } catch (error) {
        console.error("Token inválido ao iniciar a aplicação:", error);
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });

  const navigate = useNavigate();

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      
      const { access } = response.data; 
      
      localStorage.setItem('token', access);
      
      const decodedUser = jwtDecode(access);
      
      setUser(decodedUser);
      navigate('/dashboard');

    } catch (error) {
      console.error("ERRO NO LOGIN:", error.response?.data || error.message);
      localStorage.removeItem('token');
      throw error; 
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);