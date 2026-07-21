import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const AdminNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 shadow-md">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <div className="flex items-center space-x-4">
        {user && (
          <span className="text-sm">{user.email} ({user.role})</span>
        )}
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
