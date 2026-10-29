import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('redflow_token');
    const storedUser = localStorage.getItem('redflow_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('redflow_token');
        localStorage.removeItem('redflow_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('redflow_token', data.token);
    localStorage.setItem('redflow_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, phone = '') => {
    const { data } = await api.post('/auth/register', { name, email, password, phone });
    localStorage.setItem('redflow_token', data.token);
    localStorage.setItem('redflow_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = async (credential) => {
    const { data } = await api.post('/auth/google', { token: credential });
    localStorage.setItem('redflow_token', data.token);
    localStorage.setItem('redflow_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('redflow_token');
    localStorage.removeItem('redflow_user');
    setToken(null);
    setUser(null);
  };

  const refreshMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('redflow_user', JSON.stringify(data.user));
    } catch {
      logout();
    }
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, loginWithGoogle, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
