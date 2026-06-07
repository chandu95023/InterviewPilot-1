import { useState } from 'react'
import { motion } from 'framer-motion'

const Settings = () => {
  const [notifications, setNotifications] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] bg-white p-8 shadow-soft">
      <h1 className="text-3xl font-semibold text-slate-900">Settings</h1>
      <p className="mt-3 text-slate-600">Fine-tune your experience for notifications, progress reminders, and product preferences.</p>
      <div className="mt-8 space-y-8">
        <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
          <p className="mt-2 text-slate-600">Control which alerts you receive from InterviewPrep AI.</p>
          <div className="mt-6 space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-3xl bg-white p-4 shadow-sm">
              <div>
                <p className="font-semibold text-slate-900">Practice reminders</p>
                <p className="text-sm text-slate-500">Receive reminders to complete your next mock interview.</p>
              </div>
              <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-3xl bg-white p-4 shadow-sm">
              <div>
                <p className="font-semibold text-slate-900">Weekly summary</p>
                <p className="text-sm text-slate-500">Get a summary of your progress each week.</p>
              </div>
              <input type="checkbox" checked={weeklySummary} onChange={() => setWeeklySummary(!weeklySummary)} className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            </label>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Preferences</h2>
          <p className="mt-2 text-slate-600">Customize the way your dashboard and practice interface behave.</p>
          <div className="mt-6 space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-3xl bg-white p-4 shadow-sm">
              <div>
                <p className="font-semibold text-slate-900">Dark mode</p>
                <p className="text-sm text-slate-500">Enable a darker interface for low-light environments.</p>
              </div>
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            </label>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Language</p>
              <select className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

export default Settings
