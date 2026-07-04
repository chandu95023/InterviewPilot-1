import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, BookOpen, Target, AlertCircle, ChevronRight, ListChecks,
  Code, Clock, Brain, CheckCircle2, Circle, Loader2, RefreshCw,
  Calendar, Zap, FileText, PlayCircle, Globe, Trophy, GitBranch
} from 'lucide-react'
import { generateStudyPlan } from '../api/api'
import AIContextChat from '../components/AIContextChat'

const inputClass = "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
const selectClass = "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"

const STATUS_COLORS = {
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'in-progress': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  pending: 'bg-slate-700/40 text-slate-400 border-slate-700'
}

const StudyPlan = () => {
  const [domain, setDomain] = useState('Full Stack Development')
  const [currentLevel, setCurrentLevel] = useState('Beginner')
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [dailyHours, setDailyHours] = useState(2)
  const [targetCompany, setTargetCompany] = useState('')
  const [planDuration, setPlanDuration] = useState('8')
  const [weakTopics, setWeakTopics] = useState('')
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [weekStatuses, setWeekStatuses] = useState({})
  const [expandedWeek, setExpandedWeek] = useState(0)
  const [activeResource, setActiveResource] = useState('documentation')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await generateStudyPlan({
        domain,
        current_level: currentLevel,
        target_role: targetRole,
        weak_topics: weakTopics.split(',').map(t => t.trim()).filter(Boolean),
        daily_study_hours: dailyHours,
        target_company: targetCompany || null,
        plan_duration: planDuration
      })
      setPlan(response.data.study_plan)
      setWeekStatuses({})
      setExpandedWeek(0)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to generate study plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const cycleStatus = (weekIdx) => {
    const current = weekStatuses[weekIdx] || 'pending'
    const next = current === 'pending' ? 'in-progress' : current === 'in-progress' ? 'completed' : 'pending'
    setWeekStatuses(prev => ({ ...prev, [weekIdx]: next }))
  }

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    if (status === 'in-progress') return <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
    return <Circle className="h-4 w-4 text-slate-600" />
  }

  const completedCount = Object.values(weekStatuses).filter(s => s === 'completed').length
  const totalWeeks = plan?.weekly_plan?.length || 0
  const progressPct = totalWeeks ? Math.round((completedCount / totalWeeks) * 100) : 0

  const RESOURCE_TABS = [
    { key: 'documentation', label: 'Docs', icon: Globe },
    { key: 'youtube', label: 'YouTube', icon: PlayCircle },
    { key: 'articles', label: 'Articles', icon: FileText },
    { key: 'github', label: 'GitHub', icon: GitBranch },
    { key: 'platforms', label: 'Platforms', icon: Code },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">AI-Generated Study Plan</h2>
        <p className="text-xs text-slate-400 mt-1">Get a personalized multi-week study roadmap with weekly goals, daily tasks, projects, and curated resources.</p>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── CONFIG FORM ─── */}
        {!plan && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-card rounded-[2rem] p-8 border border-slate-800 bg-slate-950/40 shadow-xl max-w-2xl mx-auto space-y-6"
          >
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-950/80 px-3.5 py-1.5 text-xs text-indigo-300 border border-indigo-900/30">
                <Sparkles className="h-3.5 w-3.5" /> Smart Study Planner
              </span>
              <h1 className="text-2xl font-bold text-white">Build Your Study Plan</h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Tell us your goals — the AI generates a step-by-step plan with daily tasks, projects, and mock interview schedules.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-950/20 border border-red-900/30 p-4 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Domain</label>
                <select className={selectClass} value={domain} onChange={e => setDomain(e.target.value)}>
                  {['Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'Full Stack Development',
                    'React', 'Next.js', 'Angular', 'Vue', 'Node.js', 'Django', 'FastAPI',
                    'Data Science', 'AI/ML', 'DevOps', 'Cloud', 'Cyber Security', 'System Design',
                    'DSA', 'DBMS', 'Operating Systems', 'Computer Networks'
                  ].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Current Level</label>
                <select className={selectClass} value={currentLevel} onChange={e => setCurrentLevel(e.target.value)}>
                  {['Beginner', 'Intermediate', 'Advanced'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Target Role</label>
                <input className={inputClass} value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Software Engineer" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Target Company <span className="text-slate-500 font-normal">(optional)</span></label>
                <input className={inputClass} value={targetCompany} onChange={e => setTargetCompany(e.target.value)} placeholder="e.g. Google, Amazon..." />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Plan Duration</label>
                <select className={selectClass} value={planDuration} onChange={e => setPlanDuration(e.target.value)}>
                  <option value="8">8 Weeks</option>
                  <option value="12">12 Weeks</option>
                  <option value="24">24 Weeks</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Daily Study Hours: <span className="text-indigo-400 font-bold">{dailyHours}h</span></label>
                <input type="range" min={1} max={8} value={dailyHours} onChange={e => setDailyHours(Number(e.target.value))} className="w-full accent-indigo-500 mt-1" />
                <div className="flex justify-between text-[9px] text-slate-600"><span>1h</span><span>8h</span></div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Weak Topics <span className="text-slate-500 font-normal">(comma separated)</span></label>
                <input className={inputClass} value={weakTopics} onChange={e => setWeakTopics(e.target.value)} placeholder="e.g. Recursion, SQL Joins, React Hooks" />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !targetRole}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3.5 text-xs font-bold tracking-wide text-white hover:from-indigo-600 hover:to-violet-700 transition disabled:opacity-50"
            >
              {loading ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /><span>Generating your {planDuration}-week plan...</span></>
              ) : (
                <><Sparkles className="h-4 w-4" /><span>Generate {planDuration}-Week Study Plan</span></>
              )}
            </button>
          </motion.div>
        )}

        {/* ─── RESULTS ─── */}
        {plan && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Plan Header + Reset */}
            <div className="glass-card rounded-[2rem] p-6 border border-slate-800 bg-slate-950/40 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-950 px-3 py-1 text-[10px] text-indigo-400 border border-indigo-900/40 font-bold uppercase tracking-wider">
                    <ListChecks className="h-3.5 w-3.5" /> {planDuration}-Week Study Plan
                  </span>
                  <h2 className="text-lg font-bold text-white">{plan.headline || `${planDuration}-Week Plan for ${targetRole}`}</h2>
                  {plan.summary && <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{plan.summary}</p>}
                </div>
                <button onClick={() => setPlan(null)} className="shrink-0 flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition">
                  <RefreshCw className="h-3.5 w-3.5" /> New Plan
                </button>
              </div>

              {/* Progress bar */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400">Overall Progress</span>
                  <span className="text-white">{completedCount}/{totalWeeks} weeks · {progressPct}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>

            {/* Milestones Timeline */}
            {plan.milestones && (
              <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-950/40 shadow-md">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-4">
                  <Calendar className="h-3.5 w-3.5 text-amber-400 inline mr-1" /> Milestone Timeline
                </span>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: '1 Month', key: '1_month', color: 'text-indigo-400 border-indigo-900/30 bg-indigo-950/20' },
                    { label: '3 Months', key: '3_months', color: 'text-violet-400 border-violet-900/30 bg-violet-950/20' },
                    { label: '6 Months', key: '6_months', color: 'text-cyan-400 border-cyan-900/30 bg-cyan-950/20' },
                    { label: 'Completion', key: 'completion', color: 'text-emerald-400 border-emerald-900/30 bg-emerald-950/20' },
                  ].map(m => (
                    <div key={m.key} className={`rounded-xl border p-4 ${m.color}`}>
                      <span className="text-[9px] font-bold uppercase tracking-wider block mb-1">{m.label}</span>
                      <p className="text-xs leading-relaxed">{plan.milestones[m.key] || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              {/* ─── Weekly Plan ─── */}
              <div className="space-y-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Weekly Breakdown</span>
                {plan.weekly_plan?.map((week, idx) => {
                  const status = weekStatuses[idx] || 'pending'
                  const isOpen = expandedWeek === idx
                  return (
                    <div key={idx} className={`glass-card rounded-2xl border bg-slate-950/40 overflow-hidden transition-all ${status === 'completed' ? 'border-emerald-900/30' : status === 'in-progress' ? 'border-indigo-900/30' : 'border-slate-800'}`}>
                      <button
                        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-900/30 transition"
                        onClick={() => setExpandedWeek(isOpen ? -1 : idx)}
                      >
                        <button
                          onClick={e => { e.stopPropagation(); cycleStatus(idx) }}
                          className="shrink-0 hover:scale-110 transition-transform"
                          title="Click to cycle status"
                        >
                          {getStatusIcon(status)}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Week {week.week || idx + 1}</span>
                            {status !== 'pending' && (
                              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${STATUS_COLORS[status]}`}>
                                {status === 'completed' ? '✓ Done' : '⟳ In Progress'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-white truncate mt-0.5">{week.goal}</p>
                        </div>
                        <ChevronRight className={`h-4 w-4 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-800/50">
                              
                              {/* Topics */}
                              {week.topics?.length > 0 && (
                                <div className="space-y-2">
                                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Brain className="h-3 w-3" /> Topics
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {week.topics.map((t, i) => (
                                      <span key={i} className="text-[10px] bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 font-mono">{t}</span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Daily Tasks */}
                              {week.daily_tasks?.length > 0 && (
                                <div className="space-y-2">
                                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Daily Tasks
                                  </span>
                                  <div className="space-y-1">
                                    {week.daily_tasks.map((task, i) => (
                                      <div key={i} className="flex gap-2 items-start text-xs text-slate-300">
                                        <span className="text-cyan-500 shrink-0">•</span>{task}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Grid: Practice, Project, Assignment, Mock */}
                              <div className="grid gap-3 sm:grid-cols-2">
                                {week.practice && (
                                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                                    <span className="text-[9px] text-violet-400 font-bold uppercase tracking-wider block mb-1">
                                      <Zap className="h-3 w-3 inline mr-1" />Practice
                                    </span>
                                    <p className="text-[11px] text-slate-300 leading-relaxed">{week.practice}</p>
                                  </div>
                                )}
                                {week.project && (
                                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                                      <Code className="h-3 w-3 inline mr-1" />Project
                                    </span>
                                    <p className="text-[11px] text-slate-300 leading-relaxed">{week.project}</p>
                                  </div>
                                )}
                                {week.assignment && (
                                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                                    <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
                                      <FileText className="h-3 w-3 inline mr-1" />Assignment
                                    </span>
                                    <p className="text-[11px] text-slate-300 leading-relaxed">{week.assignment}</p>
                                  </div>
                                )}
                                {week.mock_interview && (
                                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block mb-1">
                                      <Trophy className="h-3 w-3 inline mr-1" />Mock Interview
                                    </span>
                                    <p className="text-[11px] text-slate-300 leading-relaxed">{week.mock_interview}</p>
                                  </div>
                                )}
                                {week.revision && (
                                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                                    <span className="text-[9px] text-pink-400 font-bold uppercase tracking-wider block mb-1">
                                      <BookOpen className="h-3 w-3 inline mr-1" />Revision
                                    </span>
                                    <p className="text-[11px] text-slate-300 leading-relaxed">{week.revision}</p>
                                  </div>
                                )}
                                {week.aptitude && (
                                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                                    <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wider block mb-1">
                                      <Brain className="h-3 w-3 inline mr-1" />Aptitude
                                    </span>
                                    <p className="text-[11px] text-slate-300 leading-relaxed">{week.aptitude}</p>
                                  </div>
                                )}
                                {week.coding_challenge && (
                                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 sm:col-span-2">
                                    <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider block mb-1">
                                      <Zap className="h-3 w-3 inline mr-1" />Coding Challenge
                                    </span>
                                    <p className="text-[11px] text-slate-300 leading-relaxed">{week.coding_challenge}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>

              {/* ─── Resources Sidebar ─── */}
              <div className="space-y-4">
                {plan.learning_resources && typeof plan.learning_resources === 'object' && !Array.isArray(plan.learning_resources) ? (
                  <div className="glass-card rounded-[2rem] p-5 border border-slate-800 bg-slate-950/40 shadow-md space-y-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Learning Resources</span>
                    
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-1.5">
                      {RESOURCE_TABS.map(tab => {
                        const Ic = tab.icon
                        return (
                          <button
                            key={tab.key}
                            onClick={() => setActiveResource(tab.key)}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition border ${
                              activeResource === tab.key
                                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                            }`}
                          >
                            <Ic className="h-3 w-3" />{tab.label}
                          </button>
                        )
                      })}
                    </div>

                    {/* Resource list */}
                    <div className="space-y-2">
                      {(plan.learning_resources[activeResource] || []).map((res, i) => (
                        <div key={i} className="rounded-xl border border-slate-900 bg-slate-950 p-3 flex gap-2 items-start">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-300 leading-relaxed">{res}</p>
                        </div>
                      ))}
                      {(!plan.learning_resources[activeResource] || plan.learning_resources[activeResource].length === 0) && (
                        <p className="text-xs text-slate-600 text-center py-4">No resources for this category</p>
                      )}
                    </div>
                  </div>
                ) : (
                  // Fallback for array-based resources (backward compat)
                  <div className="glass-card rounded-[2rem] p-5 border border-slate-800 bg-slate-950/40 shadow-md space-y-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Learning Resources</span>
                    {(Array.isArray(plan.learning_resources) ? plan.learning_resources : []).map((res, i) => (
                      <div key={i} className="rounded-xl border border-slate-900 bg-slate-950 p-3 flex gap-2 items-start">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-300 leading-relaxed">{res}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-950/40 shadow-md space-y-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Plan Summary</span>
                  {[
                    { label: 'Duration', value: `${planDuration} Weeks`, color: 'text-indigo-400' },
                    { label: 'Domain', value: domain, color: 'text-violet-400' },
                    { label: 'Daily Hours', value: `${dailyHours}h / day`, color: 'text-cyan-400' },
                    { label: 'Level', value: currentLevel, color: 'text-emerald-400' },
                    { label: 'Progress', value: `${progressPct}%`, color: 'text-amber-400' },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">{s.label}</span>
                      <span className={`font-bold ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Coach */}
      <AIContextChat context={{ page: 'Study Plan', domain, targetRole, difficulty: currentLevel }} />
    </div>
  )
}

export default StudyPlan
