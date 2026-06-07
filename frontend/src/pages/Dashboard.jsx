import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  CartesianGrid 
} from 'recharts'
import { 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Zap, 
  ArrowRight,
  Brain,
  Video,
  FileText,
  Building2
} from 'lucide-react'
import { getDashboardStats } from '../api/api'

const Dashboard = () => {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getDashboardStats()
      .then((response) => setStats(response.data))
      .catch(console.error)
  }, [])

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Synchronizing workspace stats...</p>
      </div>
    )
  }

  const activityData = stats.interview_history?.slice(-6).map((item, index) => ({
    name: `Run ${index + 1}`,
    score: item.score || 0
  })) || [
    { name: 'Mock 1', score: 72 },
    { name: 'Mock 2', score: 78 },
    { name: 'Mock 3', score: 84 },
    { name: 'Mock 4', score: 88 },
  ]

  const domainData = stats.domain_breakdown || [
    { name: 'Python', value: 42 },
    { name: 'Algorithms', value: 33 },
    { name: 'System Design', value: 25 },
  ]

  return (
    <div className="space-y-6">
      {/* Dynamic Header greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Performance Overview</h2>
          <p className="text-xs text-slate-400 mt-1">Practice mock interviews, analyze your skills, and check metrics.</p>
        </div>
        <Link 
          to="/mock-interview"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-650 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-[1.02] transition"
        >
          <Video className="h-3.5 w-3.5" />
          Start Mock Session
        </Link>
      </div>

      {/* Statistics widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            label: 'Total Sessions', 
            val: stats.total_interviews || 0, 
            sub: 'Interviews taken', 
            icon: CheckCircle2,
            color: 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30'
          },
          { 
            label: 'Average Score', 
            val: `${(stats.average_score || 0).toFixed(0)}%`, 
            sub: 'Accuracy average', 
            icon: Award,
            color: 'text-violet-400 bg-violet-950/40 border-violet-900/30'
          },
          { 
            label: 'Confidence Rating', 
            val: 'High', 
            sub: 'Articulation index', 
            icon: TrendingUp,
            color: 'text-cyan-400 bg-cyan-950/40 border-cyan-900/30'
          },
          { 
            label: 'Strong Domain', 
            val: stats.best_domain || 'Python', 
            sub: 'Top performance area', 
            icon: Zap,
            color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30'
          }
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} className="glass-card rounded-2xl p-5 border border-slate-800/80 shadow-md flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">{item.label}</span>
                <p className="text-2xl font-bold text-white leading-none">{item.val}</p>
                <span className="text-[10px] text-slate-450 block">{item.sub}</span>
              </div>
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${item.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Performance graphs grid */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Score trend Line Chart */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800/80 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Metrics</span>
              <h3 className="text-sm font-semibold text-white mt-0.5">Mock Evaluation History</h3>
            </div>
            <span className="rounded-full bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-900/40">
              +14% growth
            </span>
          </div>

          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0f172a', 
                    border: '1px solid #334155', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={{ fill: '#8b5cf6', stroke: '#fff', strokeWidth: 1.5, r: 4 }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill / Domain breakdowns */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800/80 shadow-md">
          <div className="mb-6">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Top Topics</span>
            <h3 className="text-sm font-semibold text-white mt-0.5">Knowledge Base Distribution</h3>
          </div>

          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainData} layout="vertical" margin={{ top: 0, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0f172a', 
                    border: '1px solid #334155', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff'
                  }} 
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#domainGrad)" 
                  radius={[6, 6, 6, 6]}
                  barSize={14}
                >
                  <defs>
                    <linearGradient id="domainGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Next Actions & Quick Shortcuts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Suggestions Panel */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800/80 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Brain className="h-4.5 w-4.5" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">AI Personal Recommendations</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
              <li className="flex gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800/40">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Focus practice on: <strong className="text-slate-200">{stats.weak_topics?.join(', ') || 'System Architecture, Algorithms'}</strong></span>
              </li>
              <li className="flex gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800/40">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Maintain eye contact and structure responses using STAR framework.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Links Panel */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800/80 shadow-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">Quick Workspace Shortcuts</h3>
          <div className="grid gap-2">
            {[
              { path: '/resume-upload', label: 'Upload ATS Resume', icon: FileText },
              { path: '/company-prep', label: 'Prepare for Companies', icon: Building2 },
              { path: '/coding-challenge', label: 'Coding assessments sandbox', icon: Zap }
            ].map((shortcut) => {
              const SIcon = shortcut.icon
              return (
                <Link 
                  key={shortcut.path}
                  to={shortcut.path}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-900/60 hover:text-white transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <SIcon className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />
                    <span>{shortcut.label}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-550 group-hover:translate-x-1 transition-transform" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

