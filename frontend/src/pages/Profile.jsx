import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getProfile, updateProfile } from '../api/api'
import { User, Mail, Save, CheckCircle, AlertCircle } from 'lucide-react'

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getProfile().then((response) => {
      setProfile(response.data)
      setName(response.data.name || '')
    }).catch(console.error)
  }, [])

  const handleSave = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')
    try {
      const response = await updateProfile({ name, email: profile.email })
      setProfile(response.data)
      setMessage('Profile updated successfully.')
      setIsError(false)
    } catch (err) {
      setMessage('Unable to save profile. Try again later.')
      setIsError(true)
    } finally {
      setIsSaving(false)
    }
  }

  if (!profile) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center space-y-3">
        <div className="h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">Loading profile...</p>
      </div>
    </div>
  )

  const initials = (name || profile.email || 'U')[0].toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6 pb-10"
    >
      {/* Profile Header Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/20 shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{name || 'Your Name'}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{profile.email}</p>
          <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
            Active Account
          </span>
        </div>
      </div>

      {/* Edit Form Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
        <h2 className="text-base font-bold text-white mb-1">Account Details</h2>
        <p className="text-xs text-slate-400 mb-6">Update your name and review your account information.</p>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                type="text"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-600" />
              <input
                value={profile.email}
                disabled
                className="w-full rounded-xl border border-slate-800 bg-slate-800/40 pl-11 pr-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-slate-600">Email address cannot be changed.</p>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3 text-sm font-bold text-white hover:from-indigo-600 hover:to-violet-700 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Status Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-5 flex items-center gap-2.5 rounded-xl p-4 text-sm ${
              isError
                ? 'bg-red-950/30 border border-red-900/40 text-red-400'
                : 'bg-emerald-950/30 border border-emerald-900/40 text-emerald-400'
            }`}
          >
            {isError
              ? <AlertCircle className="h-4 w-4 shrink-0" />
              : <CheckCircle className="h-4 w-4 shrink-0" />
            }
            {message}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Profile
