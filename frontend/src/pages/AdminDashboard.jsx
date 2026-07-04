import { useState, useEffect } from 'react'
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
  UserCheck,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react'
import { getHealthStatus } from '../api/api'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('metrics')
  const [health, setHealth] = useState(null)
  const [healthLoading, setHealthLoading] = useState(true)
  const [configList, setConfigList] = useState([
    { id: 1, key: 'OPENAI_MODEL', val: 'gpt-4o', desc: 'Active OpenAI LLM parameter' },
    { id: 2, key: 'JWT_EXPIRATION_MINUTES', val: '120', desc: 'Access token expiration ceiling' },
    { id: 3, key: 'MOCK_FALLBACK', val: 'true', desc: 'Allows mock fallbacks if AI limits exceed' }
  ])
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')

  const fetchHealth = () => {
    setHealthLoading(true)
    getHealthStatus()
      .then(res => setHealth(res.data))
      .catch(() => setHealth({ status: 'error', database: 'unknown', gemini: 'unknown' }))
      .finally(() => setHealthLoading(false))
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  const handleAddConfig = () => {
    if (!newKey || !newVal) return
    setConfigList([...configList, { id: Date.now(), key: newKey.toUpperCase(), val: newVal, desc: 'User custom parameter' }])
    setNewKey('')
    setNewVal('')
  }

  const handleDelete = (id) => {
    setConfigList(configList.filter(item => item.id !== id))
  }

  const StatusBadge = ({ status }) => {
    const isOk = status === 'connected' || status === 'healthy'
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
        isOk 
          ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30' 
          : 'text-amber-400 bg-amber-950/40 border-amber-900/30'
      }`}>
        {isOk ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {status || 'unknown'}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">Enterprise Admin Console</h2>
        <p className="text-xs text-slate-400 mt-1">Review platform health, configure LLM parameters, and monitor activity logs.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 border-b border-slate-900 pb-2">
        {[
          { id: 'metrics', label: 'Platform Health', icon: Activity },
          { id: 'config', label: 'LLM Parameters', icon: Settings },
          { id: 'users', label: 'Activity Logs', icon: UserCheck }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-md' 
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
            className="space-y-6"
          >
            {/* Real health status from API */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Live System Status</h3>
              <button 
                onClick={fetchHealth}
                disabled={healthLoading}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${healthLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { 
                  label: 'API Server', 
                  val: health?.status || 'checking...', 
                  desc: 'FastAPI backend', 
                  color: (health?.status === 'healthy') 
                    ? 'text-emerald-400 bg-emerald-950/45 border-emerald-900/40' 
                    : 'text-amber-400 bg-amber-950/45 border-amber-900/40', 
                  icon: Cpu 
                },
                { 
                  label: 'Database', 
                  val: health?.database || 'checking...', 
                  desc: 'SQLite / PostgreSQL', 
                  color: (health?.database === 'connected') 
                    ? 'text-emerald-400 bg-emerald-950/45 border-emerald-900/40' 
                    : 'text-amber-400 bg-amber-950/45 border-amber-900/40', 
                  icon: Database 
                },
                { 
                  label: 'AI Engine', 
                  val: health?.gemini || 'checking...', 
                  desc: 'Gemini / OpenAI', 
                  color: (health?.gemini === 'connected') 
                    ? 'text-emerald-400 bg-emerald-950/45 border-emerald-900/40' 
                    : 'text-amber-400 bg-amber-950/45 border-amber-900/40', 
                  icon: Brain 
                },
                { 
                  label: 'Mock Fallback', 
                  val: (health?.gemini === 'disconnected') ? 'Active' : 'Standby', 
                  desc: 'Auto-generated questions', 
                  color: 'text-cyan-400 bg-cyan-950/45 border-cyan-900/40', 
                  icon: ShieldAlert 
                }
              ].map((stat, idx) => {
                const SIcon = stat.icon
                return (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card rounded-2xl p-5 border border-slate-800 shadow-md flex justify-between items-center bg-slate-950/40"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">{stat.label}</span>
                      <StatusBadge status={stat.val} />
                      <span className="text-[10px] text-slate-450 block mt-1">{stat.desc}</span>
                    </div>
                    <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${stat.color}`}>
                      <SIcon className="h-4.5 w-4.5" />
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Informational note */}
            <div className="rounded-xl bg-indigo-950/20 border border-indigo-900/30 p-4 text-xs text-slate-400 flex gap-2">
              <Brain className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-300 mb-1">About Mock Fallback Mode</p>
                <p className="leading-relaxed">When the AI engine (Gemini/OpenAI) is disconnected, the platform automatically generates domain-specific mock questions using a curated question bank. All features remain functional — AI-generated evaluations and suggestions will use template-based responses.</p>
              </div>
            </div>
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
                  className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-650 outline-none focus:border-indigo-500 transition"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="value"
                  className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-650 outline-none focus:border-indigo-500 transition"
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                />
                <button
                  onClick={handleAddConfig}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 py-3 text-xs font-bold text-white transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Register</span>
                </button>
              </div>
            </div>

            {/* List config */}
            <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md bg-slate-950/40 space-y-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">System Parameters</span>
              <div className="space-y-2.5">
                {configList.map((cfg) => (
                  <div key={cfg.id} className="rounded-xl border border-slate-900 bg-slate-950/80 p-4 flex justify-between items-center">
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
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Recent Activity Log</span>
            <div className="space-y-2.5">
              {[
                { email: 'demo@interviewpilot.ai', act: 'Completed Mock Interview (Python)', time: 'Just now', flag: 'Active' },
                { email: 'candidate@example.com', act: 'Generated Study Plan (Java)', time: '5 mins ago', flag: 'Completed' },
                { email: 'demo@interviewpilot.ai', act: 'Uploaded Resume (ATS Analysis)', time: '14 mins ago', flag: 'Parsed' },
                { email: 'user@example.com', act: 'Company Prep — Google (Full Stack)', time: '1 hour ago', flag: 'Generated' },
                { email: 'demo@interviewpilot.ai', act: 'Coding Challenge (Arrays & Sorting)', time: '2 hours ago', flag: 'Submitted' }
              ].map((user, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-slate-900 bg-slate-950/80 p-4 flex justify-between items-center text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-300">{user.email}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{user.act} • {user.time}</p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[9px] font-bold text-indigo-400 border border-slate-800">{user.flag}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
