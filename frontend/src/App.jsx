import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import MockInterview from './pages/MockInterview'
import ResumeUpload from './pages/ResumeUpload'
import InterviewReport from './pages/InterviewReport'
import CompanyPrep from './pages/CompanyPrep'
import VoiceInterview from './pages/VoiceInterview'
import CodingChallenge from './pages/CodingChallenge'
import StudyPlan from './pages/StudyPlan'
import CompanyPerformance from './pages/CompanyPerformance'
import QuestionHistory from './pages/QuestionHistory'
import Landing from './pages/Landing'
import HRInterview from './pages/HRInterview'
import CompanyInterview from './pages/CompanyInterview'
import CareerGuidance from './pages/CareerGuidance'
import AptitudeTest from './pages/AptitudeTest'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
// AdminDashboard import removed
import AIAssistant from './pages/AIAssistant'
import ProtectedRoute from './components/ProtectedRoute'
import { Bell } from 'lucide-react'

function AppContent() {
  const location = useLocation()
  const { user } = useAuth()

  // Detect if route belongs to the application workspace
  const isDashboardRoute = [
    '/dashboard',
    '/mock-interview',
    '/coding-challenge',
    '/company-prep',
    '/resume-upload',
    '/study-plan',
    '/profile',
    '/settings',
    '/report',
    '/voice-interview',
    '/aptitude-test',
    '/career-guidance',
    '/hr-interview',
    '/company-interview',

    '/company-performance',
    '/question-history',
    '/ai-assistant'
  ].some(path => location.pathname.startsWith(path))

  const activePageLabel = location.pathname.split('/')[1]?.replace('-', ' ') || 'Workspace'

  if (isDashboardRoute) {
    return (
      <div className="flex min-h-screen bg-[#020617] text-white p-4 gap-4 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-2rem)]">
          {/* Header Bar inside application Dashboard */}
          <header className="flex items-center justify-between py-3 px-6 mb-4 glass-card rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Workspace</span>
              <span className="text-xs text-slate-600">/</span>
              <span className="text-xs font-bold text-indigo-400 capitalize">{activePageLabel}</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative text-slate-450 hover:text-white p-1 transition">
                <Bell className="h-4.5 w-4.5 text-slate-400 hover:text-white" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-450 animate-pulse" />
              </button>
              <div className="h-4 w-px bg-slate-800" />
              <div className="flex items-center gap-2.5">
                <div className="h-6.5 w-6.5 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] text-white font-bold border border-slate-800 shadow-md">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-350">{user?.name || 'User'}</span>
              </div>
            </div>
          </header>

          {/* Main workspace scrollable context */}
          <main className="flex-1 overflow-y-auto pr-1">
            <Routes>
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
              <Route path="/voice-interview" element={<ProtectedRoute><VoiceInterview /></ProtectedRoute>} />
              <Route path="/hr-interview" element={<ProtectedRoute><HRInterview /></ProtectedRoute>} />
              <Route path="/company-interview" element={<ProtectedRoute><CompanyInterview /></ProtectedRoute>} />
              <Route path="/coding-challenge" element={<ProtectedRoute><CodingChallenge /></ProtectedRoute>} />
              <Route path="/aptitude-test" element={<ProtectedRoute><AptitudeTest /></ProtectedRoute>} />
              <Route path="/resume-upload" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
              <Route path="/career-guidance" element={<ProtectedRoute><CareerGuidance /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              <Route path="/company-prep" element={<ProtectedRoute><CompanyPrep /></ProtectedRoute>} />
              <Route path="/study-plan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
              <Route path="/company-performance" element={<ProtectedRoute><CompanyPerformance /></ProtectedRoute>} />
              <Route path="/question-history" element={<ProtectedRoute><QuestionHistory /></ProtectedRoute>} />
              <Route path="/report" element={<ProtectedRoute><InterviewReport /></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </div>
    )
  }

  // Public Landing / Auth layout
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

