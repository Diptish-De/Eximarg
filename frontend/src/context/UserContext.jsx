import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const UserContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');

export const api = axios.create({
  baseURL: BACKEND_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eximarg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user context:', error);
      // If unauthorized, clear local context
      if (error.response && error.response.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('eximarg_token', token);
      await refreshUser();
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Login failed';
      toast.error(msg);
      return false;
    }
  };

  const register = async (email, password) => {
    try {
      const response = await api.post('/api/auth/register', { email, password });
      const { token } = response.data;
      localStorage.setItem('eximarg_token', token);
      await refreshUser();
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Registration failed';
      toast.error(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('eximarg_token');
    localStorage.removeItem('eximarg_demo');
    setCurrentUser(null);
    toast.info('Logged out.');
  };

  // Client-side demo bypass — no backend needed
  const demoLogin = (role = 'exporter') => {
    const demoUsers = {
      exporter: {
        id: 'demo-exporter-001',
        email: 'fresh@eximarg.com',
        role: 'exporter',
        level: 7,
        xp: 3200,
        readiness_score: 0.72,
        badges: ['identity_verified', 'profile_complete', 'docs_uploaded', 'company_branded'],
        subscription: 'growth',
        products_locked: false,
        levels_locked: false
      },
      admin: {
        id: 'demo-admin-001',
        email: 'admin@eximarg.com',
        role: 'admin',
        level: 10,
        xp: 9999,
        readiness_score: 1.0,
        badges: ['identity_verified', 'profile_complete', 'docs_uploaded', 'company_branded', 'admin_access'],
        subscription: 'enterprise',
        products_locked: false,
        levels_locked: false
      },
      service_provider: {
        id: 'demo-provider-001',
        email: 'provider@eximarg.com',
        role: 'service_provider',
        level: 5,
        xp: 1500,
        readiness_score: 0.55,
        badges: ['identity_verified'],
        subscription: 'starter',
        products_locked: false,
        levels_locked: false
      }
    };
    const user = demoUsers[role] || demoUsers.exporter;
    localStorage.setItem('eximarg_demo', 'true');
    setCurrentUser(user);
    setLoading(false);
    toast.success(`Demo mode activated as ${role}`);
    return true;
  };

  useEffect(() => {
    const isDemo = localStorage.getItem('eximarg_demo');
    if (isDemo) {
      demoLogin('exporter');
      return;
    }
    const token = localStorage.getItem('eximarg_token');
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, loading, login, register, logout, refreshUser, demoLogin }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
export { BACKEND_URL };
