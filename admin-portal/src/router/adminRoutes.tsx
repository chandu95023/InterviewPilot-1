import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from '../pages/AdminLogin';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Questions from '../pages/Questions';
import CompanyQuestions from '../pages/CompanyQuestions';
import CodingChallenges from '../pages/CodingChallenges';
import Aptitude from '../pages/Aptitude';
import StudyPlans from '../pages/StudyPlans';
import CareerRoadmaps from '../pages/CareerRoadmaps';
import ResumeRules from '../pages/ResumeRules';
import VoicePrompts from '../pages/VoicePrompts';
import AIPrompts from '../pages/AIPrompts';
import Analytics from '../pages/Analytics';
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';
import AuditLogs from '../pages/AuditLogs';
import Backups from '../pages/Backups';
import AdminProtectedRoute from '../components/AdminProtectedRoute';

export const AdminRoutes: React.FC = () => (
  <Routes>
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route
      path="/admin/*"
      element={
        <AdminProtectedRoute>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="questions" element={<Questions />} />
            <Route path="company-questions" element={<CompanyQuestions />} />
            <Route path="coding" element={<CodingChallenges />} />
            <Route path="aptitude" element={<Aptitude />} />
            <Route path="study-plans" element={<StudyPlan />} />
            <Route path="career-roadmaps" element={<CareerRoadmaps />} />
            <Route path="resume-rules" element={<ResumeRules />} />
            <Route path="voice-prompts" element={<VoicePrompts />} />
            <Route path="ai-prompts" element={<AIPrompts />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="logs" element={<AuditLogs />} />
            <Route path="backups" element={<Backups />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </AdminProtectedRoute>
      }
    />
  </Routes>
);
