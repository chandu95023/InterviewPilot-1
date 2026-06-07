import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Cpu, 
  Database, 
  Users, 
  ShieldAlert, 
  CheckCircle, 
  PlusCircle, 
  Trash2, 
  Settings,
  Brain,
  Terminal,
  Activity,
  UserCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('metrics')
  const [configList, setConfigList] = useState([
    { id: 1, key: 'OPENAI_MODEL', val: 'gpt-4o', desc: 'Active OpenAI LLM parameter' },
    { id: 2, key: 'JWT_EXPIRATION_MINUTES', val: '120', desc: 'Access token expiration ceiling' },
    { id: 3, key: 'MOCK_FALLBACK', val: 'true', desc: 'Allows mock fallbacks if OpenAI limits exceed' }
  ])
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')

  const handleAddConfig = () => {
    if (!newKey || !newVal) return
    setConfigList([...configList, { id: Date.now(), key: newKey.toUpperCase(), val: newVal, desc: 'User custom parameter' }])
    setNewKey('')
    setNewVal('')
  }

  const handleDelete = (id) => {
    setConfigList(configList.filter(item => item.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">Enterprise Admin Console</h2>
        <p className="text-xs text-slate-400 mt-1">Review mock system parameters, check data logs, and configure LLM endpoint values.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 border-b border-slate-900 pb-2">
        {[
          { id: 'metrics', label: 'Platform Health', icon: Activity },
          { id: 'config', label: 'LLM Parameters', icon: Settings },
          { id: 'users', label: 'Candidate Logs', icon: UserCheck }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition ${
                activeTab === tab.id 
                  ? 'bg-indigo-650 text-white font-bold' 
                  : 'text-slate-450 hover:bg-slate-900/60 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TABS CONTAINER */}
      <div>
        {activeTab === 'metrics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { label: 'LLM Connectivity', val: 'Operational', desc: 'OpenAI API link', color: 'text-emerald-450 bg-emerald-950/45 border-emerald-900/40', icon: Cpu },
              { label: 'Fallback Mode', val: 'Active', desc: 'Mock questions generator', color: 'text-cyan-400 bg-cyan-950/45 border-cyan-900/40', icon: Database },
              { label: 'Mock Sessions', val: '84', desc: 'Total database count', color: 'text-indigo-400 bg-indigo-950/45 border-indigo-900/40', icon: Brain },
              { label: 'Core System Health', val: '99.8%', desc: 'FastAPI uptime index', color: 'text-violet-400 bg-violet-950/45 border-violet-900/40', icon: ShieldAlert }
            ].map((stat, idx) => {
              const SIcon = stat.icon
              return (
                <div key={idx} className="glass-card rounded-2xl p-5 border border-slate-800 shadow-md flex justify-between items-center bg-slate-950/40">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">{stat.label}</span>
                    <p className="text-xl font-bold text-white font-mono">{stat.val}</p>
                    <span className="text-[10px] text-slate-450 block">{stat.desc}</span>
                  </div>
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${stat.color}`}>
                    <SIcon className="h-4.5 w-4.5" />
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'config' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Input config */}
            <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md bg-slate-950/40 space-y-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Create Configuration Parameter</span>
              <div className="grid gap-4 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="VARIABLE_NAME"
                  className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-650 outline-none focus:border-indigo-500"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="value"
                  className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-650 outline-none focus:border-indigo-500"
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                />
                <button
                  onClick={handleAddConfig}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 py-3 text-xs font-bold text-white transition"
                >
                  <PlusCircle className="h-4.5 w-4.5" />
                  <span>Register Parameter</span>
                </button>
              </div>
            </div>

            {/* List config */}
            <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md bg-slate-950/40 space-y-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">System parameters</span>
              <div className="space-y-2.5">
                {configList.map((cfg) => (
                  <div key={cfg.id} className="rounded-xl border border-slate-900 bg-slate-950/80 p-4.5 flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-xs text-indigo-400 font-mono font-bold">{cfg.key}</p>
                      <p className="text-[10px] text-slate-400 leading-normal">{cfg.desc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1 text-xs text-white font-mono">{cfg.val}</span>
                      <button
                        onClick={() => handleDelete(cfg.id)}
                        className="text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md bg-slate-950/40 space-y-3"
          >
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Candidate Activity log</span>
            <div className="space-y-2.5 font-mono">
              {[
                { email: 'cand1@example.com', act: 'Completed Mock Interview (Python)', time: '2 mins ago', flag: 'High score' },
                { email: 'cand2@example.com', act: 'Uploaded Resume PDF (ATS check)', time: '14 mins ago', flag: 'Parsing complete' },
                { email: 'cand3@example.com', act: 'Attempted Coding Challenge (Java)', time: '1 hour ago', flag: 'Timeout error fallback' }
              ].map((user, idx) => (
                <div key={idx} className="rounded-xl border border-slate-900 bg-slate-950/80 p-4.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-slate-300">{user.email}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{user.act} • {user.time}</p>
                  </div>
                  <span className="rounded bg-slate-900 px-2 py-0.5 text-[9px] font-bold text-indigo-400 border border-slate-800">{user.flag}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
