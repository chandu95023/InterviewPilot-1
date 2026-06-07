import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getProfile, updateProfile } from '../api/api'

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    getProfile().then((response) => {
      setProfile(response.data)
      setName(response.data.name)
    }).catch(console.error)
  }, [])

  const handleSave = async (event) => {
    event.preventDefault()
    try {
      const response = await updateProfile({ name, email: profile.email })
      setProfile(response.data)
      setMessage('Profile updated successfully.')
    } catch (err) {
      setMessage('Unable to save profile. Try again later.')
    }
  }

  if (!profile) return <div className="text-center py-24 text-slate-600">Loading profile...</div>

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] bg-white p-8 shadow-soft">
      <h1 className="text-3xl font-semibold text-slate-900">Account profile</h1>
      <p className="mt-3 text-slate-600">Update your name, review your email, and keep your account details current.</p>
      <form onSubmit={handleSave} className="mt-8 space-y-6">
        <div>
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input value={profile.email} disabled className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500" />
        </div>
        <button className="rounded-3xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-700">Save changes</button>
      </form>
      {message && <div className="mt-4 rounded-3xl bg-brand-50 p-4 text-sm text-brand-700">{message}</div>}
    </motion.div>
  )
}

export default Profile
