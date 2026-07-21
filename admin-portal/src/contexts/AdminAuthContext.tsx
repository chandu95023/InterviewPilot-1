// src/contexts/AdminAuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import adminApi from "../services/adminApi";

interface Admin {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface AuthContextProps {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Admin>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AuthContextProps | null>(null);
export const useAdminAuth = () => useContext(AdminAuthContext)!;

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  // initialise from stored JWT
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAdmin({
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          name: payload.name || payload.email,
        });
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp - now < 300) refreshToken();
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await adminApi.login(email, password);
    const { access_token, refresh_token, admin: adminData } = data;
    localStorage.setItem("admin_token", access_token);
    localStorage.setItem("admin_refresh", refresh_token);
    setAdmin({
      id: adminData.id,
      email: adminData.email,
      role: adminData.role,
      name: adminData.name,
    });
    return adminData;
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh");
    setAdmin(null);
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem("admin_refresh");
    if (!refresh) return logout();
    try {
      const { data } = await adminApi.refresh(refresh);
      const { access_token, refresh_token } = data;
      localStorage.setItem("admin_token", access_token);
      localStorage.setItem("admin_refresh", refresh_token);
      const payload = JSON.parse(atob(access_token.split(".")[1]));
      setAdmin(prev =>
        prev
          ? {
              ...prev,
              id: payload.sub,
              email: payload.email,
              role: payload.role,
              name: payload.name || payload.email,
            }
          : null
      );
    } catch {
      logout();
    }
  };

  const value: AuthContextProps = {
    admin,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!admin,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
