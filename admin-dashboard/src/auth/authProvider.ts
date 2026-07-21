// src/auth/authProvider.ts
import axios from 'axios';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

interface User {
  id: number;
  email: string;
  roles: string[];
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/admin/auth/me', { withCredentials: true });
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
    await axios.post(
      '/api/admin/auth/login',
      { email, password },
      { withCredentials: true }
    );
    await fetchUser();
  };

  const logout = async () => {
    await axios.post('/api/admin/auth/logout', {}, { withCredentials: true });
    setUser(null);
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
