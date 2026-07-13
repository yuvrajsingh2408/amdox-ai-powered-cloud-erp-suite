import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'HR_MANAGER' | 'FINANCE_MANAGER' | 'SCM_MANAGER' | 'PROJECT_MANAGER' | 'EMPLOYEE';
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (import.meta.env.VITE_API_URL) {
      axios.defaults.baseURL = import.meta.env.VITE_API_URL;
    }
    
    // Enable automatic CSRF token handling in Axios
    axios.defaults.xsrfCookieName = 'csrf_token';
    axios.defaults.xsrfHeaderName = 'x-csrf-token';
    axios.defaults.withCredentials = true;

    // Bootstrap CSRF cookie with a safe GET call
    axios.get('/api/health').catch(() => {});

    const storedToken = localStorage.getItem('amdox_token');
    const storedUser = localStorage.getItem('amdox_user');
    const storedTenantId = localStorage.getItem('amdox_tenant_id');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Set default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      if (storedTenantId) {
        axios.defaults.headers.common['x-tenant-id'] = storedTenantId;
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('amdox_token', newToken);
    localStorage.setItem('amdox_user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('amdox_token');
    localStorage.removeItem('amdox_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
