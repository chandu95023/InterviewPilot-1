import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Moon, Globe, CheckCircle } from 'lucide-react'

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
      checked ? 'bg-indigo-500' : 'bg-slate-700'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
)

const Settings = () => {
  const [notifications, setNotifications] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [language, setLanguage] = useState('English')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-xl font-bold text-white tracking-wide">Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Fine-tune your experience for notifications, reminders, and preferences.</p>
      </div>

      {/* Notifications Section */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">Notifications</h2>
        </div>
        <p className="text-xs text-slate-400">Control which alerts you receive from InterviewPrep AI.</p>

        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div>
              <p className="text-sm font-semibold text-white">Practice Reminders</p>
              <p className="text-xs text-slate-400 mt-0.5">Receive reminders to complete your next mock interview.</p>
            </div>
            <Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div>
              <p className="text-sm font-semibold text-white">Weekly Summary</p>
              <p className="text-xs text-slate-400 mt-0.5">Get a weekly digest of your progress and scores.</p>
            </div>
            <Toggle checked={weeklySummary} onChange={() => setWeeklySummary(!weeklySummary)} />
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Moon className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">Preferences</h2>
        </div>
        <p className="text-xs text-slate-400">Customize your dashboard and practice interface.</p>

        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div>
              <p className="text-sm font-semibold text-white">Dark Mode</p>
              <p className="text-xs text-slate-400 mt-0.5">Enable a darker interface for low-light environments.</p>
            </div>
            <Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </div>

          {/* Language Select */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-400" />
              <p className="text-sm font-semibold text-white">Language</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="Hindi">Hindi</option>
              <option value="German">German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3 text-sm font-bold text-white hover:from-indigo-600 hover:to-violet-700 transition shadow-lg shadow-indigo-500/20"
        >
          Save Preferences
        </button>
        {saved && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-xs text-emerald-400"
          >
            <CheckCircle className="h-4 w-4" />
            Settings saved!
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Settings
