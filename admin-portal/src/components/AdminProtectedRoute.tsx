// src/components/AdminProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";

export const AdminProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-gray-500">Loading…</span>
      </div>
    );
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};
