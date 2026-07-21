import React, { ReactNode } from 'react';
import AdminSidebar from './Sidebar';
import AdminNavbar from './Navbar';
import AdminFooter from './Footer';

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <AdminNavbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
};
