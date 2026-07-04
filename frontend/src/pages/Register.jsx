import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight, Sparkles, Cpu } from 'lucide-react'
import { registerUser, loginUser } from '../api/api'
import { useAuth } from '../contexts/AuthContext'

const Register = () => {
  const [name, setName] = useState('')
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
      await registerUser({ name, email, password })
      // Auto-login after successful registration
      const loginRes = await loginUser({ username: email, password })
      login(loginRes.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      const detail = err?.response?.data?.detail
      if (detail === 'Email already registered') {
        setError('This email is already registered. Please login instead.')
      } else if (!err?.response) {
        setError('Cannot connect to the server. Please make sure the backend is running.')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
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
          Accelerate Your Interview Readiness today.
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Create an account to begin mock interviews in seconds. Upload your resume to extract skills and compile customizable test modules.
        </p>

        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-5 space-y-3">
          <div className="flex gap-2">
            <Cpu className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Full Performance Dashboard</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Track scoring progress history, domain expertise levels, weak areas, and progress over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Form Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }}
        className="glass-card rounded-[2rem] p-8 border border-slate-800/80 shadow-2xl relative"
      >
        <div className="absolute -top-12 -left-12 h-32 w-32 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="mb-6">
          <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Get Started</span>
          <h1 className="mt-2 text-2xl font-bold text-white">Join InterviewPrep AI</h1>
          <p className="mt-1.5 text-xs text-slate-450">Join thousands of engineers practicing with AI.</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-950/30 border border-red-900/40 p-3.5 text-xs text-red-400 leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-550" />
              <input 
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-11 pr-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500/30" 
                placeholder="John Doe"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                type="text" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-550" />
              <input 
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-11 pr-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500/30" 
                placeholder="name@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-550" />
              <input 
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-11 pr-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500/30" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type="password" 
                required 
              />
            </div>
          </div>

          <button 
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3.5 text-xs font-bold tracking-wide text-white hover:from-indigo-600 hover:to-violet-700 transition shadow-lg shadow-indigo-500/10 cursor-pointer disabled:opacity-50" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-350 transition">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Register

