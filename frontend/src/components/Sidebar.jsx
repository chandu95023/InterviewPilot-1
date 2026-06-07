import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Video, 
  FileText, 
  Building2, 
  Terminal, 
  BookOpen, 
  User, 
  Settings as SettingsIcon, 
  LogOut,
  Mic,
  HelpCircle,
  Sparkles
} from 'lucide-react'

const links = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Mock Interview', path: '/mock-interview', icon: Video },
  { label: 'Voice Interview', path: '/voice-interview', icon: Mic },
  { label: 'Coding Challenge', path: '/coding-challenge', icon: Terminal },
  { label: 'Company Prep', path: '/company-prep', icon: Building2 },
  { label: 'Aptitude Test', path: '/aptitude-test', icon: HelpCircle },
  { label: 'Resume Analyzer', path: '/resume-upload', icon: FileText },
  { label: 'Study Plan', path: '/study-plan', icon: BookOpen },
  { label: 'Career Guidance', path: '/career-guidance', icon: Sparkles },
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between glass-card rounded-3xl p-5 border border-slate-800/80 shadow-2xl h-[calc(100vh-2rem)] sticky top-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800/60">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-indigo-500/20">
            AI
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white leading-none">InterviewPrep</h1>
            <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">Enterprise AI</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold tracking-wide transition-all duration-200 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white shadow-md shadow-indigo-600/10' 
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                    <span>{link.label}</span>
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="border-t border-slate-800/60 pt-4 mt-4 space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-300">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">{user.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email || 'user@example.com'}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 text-xs font-semibold tracking-wide text-slate-400 transition hover:bg-red-950/20 hover:border-red-900/30 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

