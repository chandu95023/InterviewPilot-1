import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Sparkles, Cpu, Zap } from 'lucide-react'
import { loginUser } from '../api/api'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const response = await loginUser({ username: email, password })
      login(response.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        setError('Invalid email or password. Please check your credentials and try again.')
      } else if (!err?.response) {
        setError('Cannot connect to the server. Please make sure the backend is running.')
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail('demo@interviewpilot.ai')
    setPassword('demo1234')
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-[1fr_1.1fr] items-center">
      {/* Visual Info Column */}
      <div className="space-y-6 hidden md:block">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-950/60 px-3 py-1 text-xs text-indigo-300 border border-indigo-900/30">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive AI Coach</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
          Redesigning How You Achieve Job Offers.
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Log in to access customized mock schedules, company performance databases, and deep AI-driven transcript analytics.
        </p>

        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-5 space-y-3">
          <div className="flex gap-2">
            <Cpu className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Advanced Response Processing</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Evaluates confidence, speaking speed, eye contact, and structure (STAR pattern) in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-4 space-y-1.5">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="h-3 w-3" /> Quick Demo Access
          </p>
          <p className="text-[10px] text-slate-400">Email: <span className="text-white font-mono">demo@interviewpilot.ai</span></p>
          <p className="text-[10px] text-slate-400">Password: <span className="text-white font-mono">demo1234</span></p>
        </div>
      </div>

      {/* Login Card Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-[2rem] p-8 border border-slate-800/80 shadow-2xl relative"
      >
        <div className="absolute -top-12 -left-12 h-32 w-32 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="mb-6">
          <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Welcome Back</span>
          <h1 className="mt-2 text-2xl font-bold text-white">Login to InterviewPrep AI</h1>
          <p className="mt-1.5 text-xs text-slate-400">Guided practice for professional career success.</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-950/30 border border-red-900/40 p-3.5 text-xs text-red-400 leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-11 pr-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link
                to="/forgot-password"
                className="text-[10px] text-indigo-400 hover:text-indigo-300 transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-11 pr-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>
          </div>

          <button
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3.5 text-xs font-bold tracking-wide text-white hover:from-indigo-600 hover:to-violet-700 transition shadow-lg shadow-indigo-500/10 disabled:opacity-50"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-800/50 bg-indigo-950/30 py-3 text-xs font-semibold text-indigo-300 hover:bg-indigo-950/60 hover:border-indigo-700 transition"
          >
            <Zap className="h-3.5 w-3.5" />
            Fill Demo Credentials
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          New to InterviewPrep AI?{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Login
