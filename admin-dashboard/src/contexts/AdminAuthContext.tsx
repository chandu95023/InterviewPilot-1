import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

type AdminUser = {
  id: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/admin/me', { withCredentials: true });
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    await axios.post('/api/admin/login', { email, password }, { withCredentials: true });
    await fetchUser();
  };

  const logout = async () => {
    await axios.post('/api/admin/logout', {}, { withCredentials: true });
    setUser(null);
  };

  const refresh = async () => {
    await axios.post('/api/admin/refresh', {}, { withCredentials: true });
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
