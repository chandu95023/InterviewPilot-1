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
  CartesianGrid,
  RadialBarChart,
  RadialBar
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
  Building2,
  BookOpen,
  Sparkles,
  Clock
} from 'lucide-react'
import { getDashboardStats, getLatestStudyPlan } from '../api/api'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [studyPlan, setStudyPlan] = useState(null)

  useEffect(() => {
    getDashboardStats()
      .then((response) => setStats(response.data))
      .catch(console.error)

    getLatestStudyPlan()
      .then((res) => setStudyPlan(res.data))
      .catch(() => {})
  }, [])

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Synchronizing workspace stats...</p>
      </div>
    )
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const activityData = stats.interview_history?.slice(0, 8).reverse().map((item, index) => ({
    name: `S${index + 1}`,
    score: typeof item.score === 'number' ? Math.round(item.score) : 0
  })) || [
    { name: 'S1', score: 65 },
    { name: 'S2', score: 72 },
    { name: 'S3', score: 78 },
    { name: 'S4', score: 84 },
    { name: 'S5', score: 88 },
  ]

  const domainData = stats.domain_breakdown?.slice(0, 6) || [
    { name: 'Python', value: 4 },
    { name: 'Algorithms', value: 3 },
    { name: 'System Design', value: 2 },
  ]

  const avgScore = stats.average_score || 0
  const readinessLevel = avgScore >= 80 ? 'High' : avgScore >= 60 ? 'Medium' : 'Building'
  const readinessColor = avgScore >= 80 ? 'text-emerald-400' : avgScore >= 60 ? 'text-yellow-400' : 'text-indigo-400'

  return (
    <div className="space-y-6">
      {/* Dynamic Header greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            {greeting}, <span className="text-indigo-400">{user?.name?.split(' ')[0] || 'there'}</span> 👋
          </h2>
          <p className="text-xs text-slate-400 mt-1">Here's your performance overview and recommendations.</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/mock-interview"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-[1.02] transition"
          >
            <Video className="h-3.5 w-3.5" />
            Start Session
          </Link>
          <Link 
            to="/study-plan"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800/60 hover:text-white transition"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Study Plan
          </Link>
        </div>
      </div>

      {/* Statistics widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            label: 'Total Sessions', 
            val: stats.total_interviews || 0, 
            sub: 'Interviews completed', 
            icon: CheckCircle2,
            color: 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30'
          },
          { 
            label: 'Average Score', 
            val: `${avgScore.toFixed(0)}%`, 
            sub: 'Overall accuracy', 
            icon: Award,
            color: 'text-violet-400 bg-violet-950/40 border-violet-900/30'
          },
          { 
            label: 'Readiness', 
            val: readinessLevel, 
            sub: 'Interview confidence', 
            icon: TrendingUp,
            color: `${readinessColor} bg-cyan-950/40 border-cyan-900/30`
          },
          { 
            label: 'Top Domain', 
            val: stats.best_domain || 'Python', 
            sub: 'Strongest skill area', 
            icon: Zap,
            color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30'
          }
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="glass-card rounded-2xl p-5 border border-slate-800/80 shadow-md flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">{item.label}</span>
                <p className="text-2xl font-bold text-white leading-none">{item.val}</p>
                <span className="text-[10px] text-slate-450 block">{item.sub}</span>
              </div>
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${item.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Performance graphs grid */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Score trend Line Chart */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800/80 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Progress</span>
              <h3 className="text-sm font-semibold text-white mt-0.5">Score Trend</h3>
            </div>
            <Link to="/question-history" className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition">
              View history <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="h-56 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0f172a', 
                    border: '1px solid #334155', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff' 
                  }} 
                  formatter={(val) => [`${val}%`, 'Score']}
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

        {/* Domain distribution */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800/80 shadow-md">
          <div className="mb-6">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Topics</span>
            <h3 className="text-sm font-semibold text-white mt-0.5">Domain Distribution</h3>
          </div>

          {domainData.length > 0 ? (
            <div className="h-56 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={domainData} layout="vertical" margin={{ top: 0, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} width={80} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#0f172a', 
                      border: '1px solid #334155', 
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#fff'
                    }} 
                    formatter={(val) => [val, 'Sessions']}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
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
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center space-y-3">
              <Brain className="h-8 w-8 text-slate-700" />
              <p className="text-xs text-slate-500">Complete a few interviews to see your domain distribution.</p>
              <Link to="/mock-interview" className="text-xs text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1">
                Start now <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recommendations + Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Recommendations */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800/80 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Brain className="h-4.5 w-4.5" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">AI Recommendations</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
              <li className="flex gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800/40">
                <span className="text-indigo-400 font-bold mt-0.5">•</span>
                <span>
                  {stats.weak_topics?.length > 0 
                    ? <>Focus on: <strong className="text-slate-200">{stats.weak_topics.slice(0, 3).join(', ')}</strong></>
                    : <>Keep practicing consistently — aim for <strong className="text-slate-200">3 sessions/week</strong> to build fluency.</>
                  }
                </span>
              </li>
              <li className="flex gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800/40">
                <span className="text-cyan-400 font-bold mt-0.5">•</span>
                <span>Use the <strong className="text-slate-200">STAR method</strong> when answering behavioral questions to structure impactful responses.</span>
              </li>
              {studyPlan?.career_roadmap && (
                <li className="flex gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800/40">
                  <span className="text-violet-400 font-bold mt-0.5">•</span>
                  <span>Your career roadmap is ready — check <strong className="text-slate-200">Career Guidance</strong> for your next milestones.</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Quick Links Panel */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800/80 shadow-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">Quick Actions</h3>
          <div className="grid gap-2">
            {[
              { path: '/resume-upload', label: 'Upload ATS Resume', icon: FileText, desc: 'Analyze & get recommendations' },
              { path: '/company-prep', label: 'Company-Specific Prep', icon: Building2, desc: 'Google, Amazon, Microsoft...' },
              { path: '/coding-challenge', label: 'Coding Sandbox', icon: Zap, desc: 'DSA & system design problems' },
              { path: '/career-guidance', label: 'Career Roadmap', icon: Sparkles, desc: 'Personalized 4-week plan' },
            ].map((shortcut) => {
              const SIcon = shortcut.icon
              return (
                <Link 
                  key={shortcut.path}
                  to={shortcut.path}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-900/60 hover:text-white hover:border-slate-700 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center group-hover:bg-indigo-950/50 group-hover:border-indigo-900/40 transition">
                      <SIcon className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-400 transition" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{shortcut.label}</p>
                      <p className="text-[10px] text-slate-500 font-normal">{shortcut.desc}</p>
                    </div>
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
