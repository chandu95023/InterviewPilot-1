import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminLayout } from '@/components/layout/AdminLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Users from '@/pages/Users';
import InterviewQuestions from '@/pages/InterviewQuestions';
import CompanyQuestions from '@/pages/CompanyQuestions';
import CodingChallenges from '@/pages/CodingChallenges';
import Aptitude from '@/pages/Aptitude';
import StudyPlans from '@/pages/StudyPlans';
import CareerRoadmaps from '@/pages/CareerRoadmaps';
import ResumeRules from '@/pages/ResumeRules';
import VoicePrompts from '@/pages/VoicePrompts';
import AIPrompts from '@/pages/AIPrompts';
import Analytics from '@/pages/Analytics';
import Notifications from '@/pages/Notifications';
import Settings from '@/pages/Settings';
import Logs from '@/pages/Logs';
import BackupRestore from '@/pages/BackupRestore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAdminAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="questions" element={<InterviewQuestions />} />
                <Route path="company-questions" element={<CompanyQuestions />} />
                <Route path="coding" element={<CodingChallenges />} />
                <Route path="aptitude" element={<Aptitude />} />
                <Route path="study-plans" element={<StudyPlans />} />
                <Route path="career-roadmaps" element={<CareerRoadmaps />} />
                <Route path="resume-rules" element={<ResumeRules />} />
                <Route path="voice-prompts" element={<VoicePrompts />} />
                <Route path="ai-prompts" element={<AIPrompts />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
                <Route path="logs" element={<Logs />} />
                <Route path="backups" element={<BackupRestore />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
