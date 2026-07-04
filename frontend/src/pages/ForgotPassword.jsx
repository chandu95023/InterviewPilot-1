import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react'
import api from '../api/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setSuccess(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-[1fr_1.1fr] items-center">
      {/* Left Column */}
      <div className="space-y-6 hidden md:block">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-950/60 px-3 py-1 text-xs text-indigo-300 border border-indigo-900/30">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Account Recovery</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
          Recover Your Account Access.
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Enter your registered email address and we'll send you instructions to reset your password and regain access to your account.
        </p>
      </div>

      {/* Right Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-[2rem] p-8 border border-slate-800/80 shadow-2xl relative"
      >
        <div className="absolute -top-12 -left-12 h-32 w-32 bg-indigo-500/10 rounded-full blur-3xl" />

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 py-4"
          >
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">Check your email</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              If <span className="text-indigo-400 font-semibold">{email}</span> is registered, you'll receive a password reset link shortly.
            </p>
            <p className="text-[10px] text-slate-500 mt-2">
              💡 <strong>Dev mode:</strong> Use your email as the reset token on the reset page.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Password Recovery</span>
              <h1 className="mt-2 text-2xl font-bold text-white">Forgot your password?</h1>
              <p className="mt-1.5 text-xs text-slate-400">Enter your email and we'll send a reset link.</p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl bg-red-950/30 border border-red-900/40 p-3.5 text-xs text-red-400">
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

              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3.5 text-xs font-bold tracking-wide text-white hover:from-indigo-600 hover:to-violet-700 transition shadow-lg shadow-indigo-500/10 disabled:opacity-50"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              Remember your password?{' '}
              <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
                Back to Login
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default ForgotPassword
