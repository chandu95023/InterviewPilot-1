import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Bell, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  // Hide the global navbar if we're inside the dashboard app layout
  const isDashboardRoute = [
    '/dashboard',
    '/mock-interview',
    '/coding-challenge',
    '/company-prep',
    '/resume-upload',
    '/study-plan',
    '/profile',
    '/settings',
    '/report'
  ].some(path => location.pathname.startsWith(path))

  if (isDashboardRoute) return null

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4">
      <div className="max-w-6xl mx-auto glass-nav rounded-2xl px-6 py-3.5 flex items-center justify-between border border-slate-800/40 shadow-xl">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 text-base font-bold text-white tracking-wide">
          <div className="h-8.5 w-8.5 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            AI
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            InterviewPrep AI
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide text-slate-400">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-white font-bold' : 'hover:text-white transition'}>Home</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'text-white font-bold' : 'hover:text-white transition'}>Dashboard</NavLink>
              <NavLink to="/mock-interview" className={({ isActive }) => isActive ? 'text-white font-bold' : 'hover:text-white transition'}>Mock Interview</NavLink>
              <NavLink to="/resume-upload" className={({ isActive }) => isActive ? 'text-white font-bold' : 'hover:text-white transition'}>Resume</NavLink>
            </>
          ) : (
            <>
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#testimonials" className="hover:text-white transition">Reviews</a>
            </>
          )}
        </nav>

        {/* Right action group */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <button className="relative text-slate-400 hover:text-white transition p-1">
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </button>
              <Link to="/profile" className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 pl-2 pr-3 py-1 text-slate-300 hover:border-slate-700 hover:text-white transition text-xs font-medium">
                <div className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span>{user.name || 'Profile'}</span>
              </Link>
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="rounded-xl border border-slate-800 bg-slate-900/40 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-slate-400 transition hover:bg-red-950/20 hover:border-red-900/30 hover:text-red-400"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-xs font-semibold tracking-wide text-slate-400 hover:text-white transition">
                Sign in
              </Link>
              <Link to="/register" className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4.5 py-2 text-xs font-semibold tracking-wide text-white hover:from-indigo-600 hover:to-violet-700 transition shadow-lg shadow-indigo-500/25">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-slate-400 hover:text-white p-1">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {isOpen && (
        <div className="md:hidden mt-2 p-5 glass-card rounded-2xl border border-slate-800/60 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3 text-xs font-semibold text-slate-400">
            <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-white py-1">Home</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="hover:text-white py-1">Dashboard</Link>
                <Link to="/mock-interview" onClick={() => setIsOpen(false)} className="hover:text-white py-1">Mock Interview</Link>
                <Link to="/resume-upload" onClick={() => setIsOpen(false)} className="hover:text-white py-1">Resume Analyzer</Link>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="hover:text-white py-1">Profile</Link>
              </>
            ) : (
              <>
                <a href="#features" onClick={() => setIsOpen(false)} className="hover:text-white py-1">Features</a>
                <a href="#testimonials" onClick={() => setIsOpen(false)} className="hover:text-white py-1">Reviews</a>
              </>
            )}
          </nav>
          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
            {user ? (
              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                  navigate('/login')
                }}
                className="w-full text-center rounded-xl bg-red-950/20 border border-red-900/30 py-2 text-xs font-semibold text-red-400 hover:bg-red-900/20"
              >
                Logout
              </button>
            ) : (
              <div className="w-full flex items-center gap-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="w-1/2 text-center py-2 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 rounded-xl">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="w-1/2 text-center py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar

