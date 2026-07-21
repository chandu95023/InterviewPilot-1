// src/router/index.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import UserManagement from '@/pages/UserManagement';
import InterviewQuestions from '@/pages/InterviewQuestions';
import ProtectedRoute from '@/components/ProtectedRoute';

const AdminRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRoles={["Super Admin", "Admin", "Content Manager", "Question Reviewer", "Read-Only Admin"]}>
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="questions" element={<InterviewQuestions />} />
              {/* Add other admin routes here */}
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AdminRouter;

// Placeholder LoginPage component (to be replaced with real implementation)
const LoginPage: React.FC = () => {
  return <div>Admin Login Page (TODO)</div>;
};
