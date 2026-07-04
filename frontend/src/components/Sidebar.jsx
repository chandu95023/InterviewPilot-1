import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
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
  Sparkles,
  Users,
  History,
  BarChart2,
  ChevronDown,
  ChevronRight,
  ClipboardList
} from 'lucide-react'

const mainLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Coach Chat', path: '/ai-assistant', icon: Sparkles },
  { label: 'Study Plan', path: '/study-plan', icon: BookOpen },
  { label: 'Career Guidance', path: '/career-guidance', icon: Sparkles },
]

const interviewLinks = [
  { label: 'Mock Interview', path: '/mock-interview', icon: Video },
  { label: 'Voice Interview', path: '/voice-interview', icon: Mic },
  { label: 'HR Interview', path: '/hr-interview', icon: Users },
  { label: 'Company Interview', path: '/company-interview', icon: Building2 },
]

const toolLinks = [
  { label: 'Coding Challenge', path: '/coding-challenge', icon: Terminal },
  { label: 'Aptitude Test', path: '/aptitude-test', icon: HelpCircle },
  { label: 'Resume Analyzer', path: '/resume-upload', icon: FileText },
  { label: 'Company Prep', path: '/company-prep', icon: Building2 },
]

const historyLinks = [
  { label: 'Interview History', path: '/question-history', icon: History },
  { label: 'Interview Reports', path: '/report', icon: ClipboardList },
  { label: 'Company Analytics', path: '/company-performance', icon: BarChart2 },
]

const bottomLinks = [
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
]

const NavSection = ({ title, links, collapsed }) => {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-2 py-1.5 mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-400 transition"
      >
        <span>{title}</span>
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {open && (
        <nav className="space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white shadow-md shadow-indigo-600/10' 
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                    <span className="truncate">{link.label}</span>
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      )}
    </div>
  )
}

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="w-60 shrink-0 flex flex-col justify-between glass-card rounded-3xl p-4 border border-slate-800/80 shadow-2xl h-[calc(100vh-2rem)] sticky top-4">
      <div className="flex flex-col min-h-0 space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-2 border-b border-slate-800/60 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-indigo-500/20">
            AI
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wide text-white leading-none">InterviewPrep</h1>
            <span className="text-[9px] text-indigo-400 font-medium tracking-wider uppercase">Enterprise AI</span>
          </div>
        </div>

        {/* Scrollable Nav */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 min-h-0">
          <NavSection title="Overview" links={mainLinks} />
          <NavSection title="Interviews" links={interviewLinks} />
          <NavSection title="Practice Tools" links={toolLinks} />
          <NavSection title="History & Reports" links={historyLinks} />
          
          {/* Bottom nav items */}
          <div className="border-t border-slate-800/60 pt-3 space-y-0.5">
            {bottomLinks.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200 group ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white shadow-md' 
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                      <span>{link.label}</span>
                      {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="border-t border-slate-800/60 pt-3 mt-2 space-y-2 shrink-0">
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.name || 'User'}</p>
              <p className="text-[9px] text-slate-500 truncate">{user.email || 'user@example.com'}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 py-2 text-xs font-semibold tracking-wide text-slate-400 transition hover:bg-red-950/20 hover:border-red-900/30 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
