import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, BookOpen, TrendingUp, AlertCircle, ChevronRight, Compass,
  Target, Briefcase, Clock, Award, Code, ArrowRight, RefreshCw, Star,
  DollarSign, Building2, FileText, Globe, Users, Lightbulb,
  CheckCircle, Shield, Rocket, BarChart2, GraduationCap
} from 'lucide-react'
import { generateCareerGuidance } from '../api/api'
import AIContextChat from '../components/AIContextChat'

const inputClass = "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
const selectClass = "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"

const SectionCard = ({ title, icon: Icon, color = 'text-indigo-400', children, className = '' }) => (
  <div className={`glass-card rounded-2xl p-5 border border-slate-800 bg-slate-950/40 shadow-md space-y-3 ${className}`}>
    <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${color}`}>
      <Icon className="h-3.5 w-3.5" />{title}
    </span>
    {children}
  </div>
)

const TagList = ({ items = [], color = 'bg-slate-900 border-slate-800 text-slate-300' }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item, i) => (
      <span key={i} className={`text-[10px] border rounded-lg px-2.5 py-1 font-mono ${color}`}>{item}</span>
    ))}
  </div>
)

const BulletList = ({ items = [], bullet = '•', bulletColor = 'text-indigo-400' }) => (
  <div className="space-y-2">
    {items.map((item, i) => (
      <div key={i} className="flex gap-2 items-start">
        <span className={`shrink-0 mt-0.5 ${bulletColor}`}>{bullet}</span>
        <p className="text-xs text-slate-300 leading-relaxed">{item}</p>
      </div>
    ))}
  </div>
)

const PHASE_COLORS = [
  'from-indigo-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-600',
  'from-indigo-600 to-violet-700',
  'from-teal-500 to-emerald-600',
]

const CareerGuidance = () => {
  const [targetRole, setTargetRole] = useState('Full Stack Engineer')
  const [domain, setDomain] = useState('Full Stack Development')
  const [currentLevel, setCurrentLevel] = useState('Intermediate')
  const [yearsExperience, setYearsExperience] = useState('1-2')
  const [targetCompany, setTargetCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roadmap, setRoadmap] = useState(null)
  const [activeTab, setActiveTab] = useState('roadmap')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setRoadmap(null)
    try {
      const response = await generateCareerGuidance({
        domain,
        current_level: currentLevel,
        target_role: targetRole,
        years_experience: yearsExperience,
        target_company: targetCompany || null
      })
      if (response.data?.career_roadmap) {
        setRoadmap(response.data.career_roadmap)
        setActiveTab('roadmap')
      } else {
        setError('Failed to generate roadmap. Please try again.')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not connect to career guidance engine.')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'roadmap', label: 'Roadmap', icon: TrendingUp },
    { id: 'skills', label: 'Skills & Tech', icon: Code },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'career', label: 'Career Path', icon: Briefcase },
    { id: 'tips', label: 'Interview Tips', icon: Award },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">AI Career Guidance</h2>
        <p className="text-xs text-slate-400 mt-1">Get a complete AI-generated career roadmap with skills analysis, learning phases, certifications, salary insights, and interview preparation.</p>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── FORM ─── */}
        {!roadmap && (
          <motion.div key="form" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            className="glass-card rounded-[2rem] p-8 border border-slate-800 shadow-xl max-w-2xl mx-auto space-y-6 bg-slate-950/40"
          >
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-950/80 px-3.5 py-1.5 text-xs text-indigo-300 border border-indigo-900/30">
                <Compass className="h-3.5 w-3.5 text-indigo-400" /> Career Navigation Engine
              </span>
              <h1 className="text-2xl font-bold text-white tracking-wide">Generate Career Roadmap</h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Get a complete 8-phase career roadmap with skill gap analysis, certifications, salary insights, and placement readiness plan.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-950/20 border border-red-900/30 p-4 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-indigo-400" /> Target Role
                </label>
                <input type="text" className={inputClass} placeholder="e.g. Senior Full Stack Engineer, ML Engineer..."
                  value={targetRole} onChange={e => setTargetRole(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Core Domain</label>
                <select className={selectClass} value={domain} onChange={e => setDomain(e.target.value)}>
                  {['Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'Full Stack Development',
                    'React', 'Next.js', 'Angular', 'Node.js', 'Django', 'FastAPI',
                    'Data Science', 'AI/ML', 'DevOps', 'Cloud', 'Cyber Security', 'System Design', 'Mobile Development'
                  ].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Current Level</label>
                <select className={selectClass} value={currentLevel} onChange={e => setCurrentLevel(e.target.value)}>
                  {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Years of Experience</label>
                <select className={selectClass} value={yearsExperience} onChange={e => setYearsExperience(e.target.value)}>
                  {['0-1', '1-2', '2-4', '4-6', '6-10', '10+'].map(yr => <option key={yr} value={yr}>{yr} years</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Target Company <span className="text-slate-500 font-normal">(optional)</span></label>
                <input type="text" className={inputClass} placeholder="e.g. Google, Amazon, Startup..." value={targetCompany} onChange={e => setTargetCompany(e.target.value)} />
              </div>
            </div>

            <button onClick={handleGenerate} disabled={loading || !targetRole}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3.5 text-xs font-bold tracking-wide text-white hover:from-indigo-600 hover:to-violet-700 transition disabled:opacity-50"
            >
              {loading ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /><span>AI generating your career roadmap...</span></>
              ) : (
                <><Sparkles className="h-4 w-4" /><span>Generate Complete Career Roadmap</span></>
              )}
            </button>
          </motion.div>
        )}

        {/* ─── RESULTS ─── */}
        {roadmap && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Header card */}
            <div className="glass-card rounded-[2rem] p-6 border border-slate-800 bg-slate-950/40 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-950 px-3 py-1 text-[10px] text-indigo-400 border border-indigo-900/40 font-bold uppercase tracking-wider">
                    <TrendingUp className="h-3.5 w-3.5" /> AI Career Roadmap
                  </span>
                  <h2 className="text-lg font-bold text-white">{roadmap.headline || `Career Roadmap: ${targetRole}`}</h2>
                  {roadmap.summary && <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">{roadmap.summary}</p>}
                  {roadmap.estimated_timeline && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-semibold">{roadmap.estimated_timeline}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setRoadmap(null)}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> New Plan
                </button>
              </div>

              {/* Quick stat row */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Domain', value: domain, color: 'text-indigo-400' },
                  { label: 'Level', value: currentLevel, color: 'text-violet-400' },
                  { label: 'Experience', value: `${yearsExperience} yrs`, color: 'text-cyan-400' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-center">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">{s.label}</span>
                    <span className={`text-xs font-bold ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 flex-wrap">
              {TABS.map(tab => {
                const Ic = tab.icon
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold border transition ${
                      activeTab === tab.id
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Ic className="h-3.5 w-3.5" />{tab.label}
                  </button>
                )
              })}
            </div>

            {/* ─── TAB: ROADMAP ─── */}
            {activeTab === 'roadmap' && (
              <div className="space-y-4">
                {/* 8-Phase Roadmap */}
                {roadmap.weekly_plan?.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">8-Phase Career Roadmap</span>
                    {roadmap.weekly_plan.map((phase, idx) => (
                      <div key={idx} className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-950/40 flex gap-4">
                        <div className={`shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br ${PHASE_COLORS[idx % PHASE_COLORS.length]} flex items-center justify-center`}>
                          <span className="text-sm font-extrabold text-white">{idx + 1}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Phase {idx + 1}</span>
                          <p className="text-xs text-slate-200 leading-relaxed">{phase}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Salary Insights */}
                {roadmap.salary_insights && (
                  <SectionCard title="Salary Insights" icon={DollarSign} color="text-emerald-400">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Entry Level', key: 'entry', color: 'text-slate-300' },
                        { label: 'Mid Level', key: 'mid', color: 'text-indigo-300' },
                        { label: 'Senior Level', key: 'senior', color: 'text-emerald-300' },
                      ].map(s => roadmap.salary_insights[s.key] && (
                        <div key={s.key} className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-center">
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">{s.label}</span>
                          <span className={`text-xs font-bold ${s.color}`}>{roadmap.salary_insights[s.key]}</span>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Company Targets */}
                {roadmap.company_targets?.length > 0 && (
                  <SectionCard title="Target Companies" icon={Building2} color="text-violet-400">
                    <TagList items={roadmap.company_targets} color="bg-violet-950/30 border-violet-900/30 text-violet-300" />
                  </SectionCard>
                )}
              </div>
            )}

            {/* ─── TAB: SKILLS ─── */}
            {activeTab === 'skills' && (
              <div className="grid gap-4 md:grid-cols-2">
                {roadmap.skills_to_develop?.length > 0 && (
                  <SectionCard title="Skills to Develop" icon={Code} color="text-cyan-400" className="md:col-span-2">
                    <TagList items={roadmap.skills_to_develop} color="bg-cyan-950/30 border-cyan-900/30 text-cyan-300" />
                  </SectionCard>
                )}
                {roadmap.current_skill_assessment && (
                  <SectionCard title="Current Skill Assessment" icon={BarChart2} color="text-indigo-400">
                    <p className="text-xs text-slate-300 leading-relaxed">{roadmap.current_skill_assessment}</p>
                  </SectionCard>
                )}
                {roadmap.missing_skills?.length > 0 && (
                  <SectionCard title="Missing Skills / Gaps" icon={AlertCircle} color="text-red-400">
                    <TagList items={roadmap.missing_skills} color="bg-red-950/30 border-red-900/30 text-red-300" />
                  </SectionCard>
                )}
                {roadmap.required_technologies?.length > 0 && (
                  <SectionCard title="Required Technologies" icon={Code} color="text-emerald-400" className="md:col-span-2">
                    <TagList items={roadmap.required_technologies} color="bg-emerald-950/30 border-emerald-900/30 text-emerald-300" />
                  </SectionCard>
                )}
                {roadmap.certifications?.length > 0 && (
                  <SectionCard title="Certification Recommendations" icon={GraduationCap} color="text-amber-400" className="md:col-span-2">
                    <BulletList items={roadmap.certifications} bullet="🎓" bulletColor="text-amber-400" />
                  </SectionCard>
                )}
              </div>
            )}

            {/* ─── TAB: RESOURCES ─── */}
            {activeTab === 'resources' && (
              <div className="grid gap-4 md:grid-cols-2">
                {roadmap.learning_resources?.length > 0 && (
                  <SectionCard title="Learning Resources" icon={BookOpen} color="text-indigo-400" className="md:col-span-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {roadmap.learning_resources.map((res, i) => (
                        <div key={i} className="rounded-xl border border-slate-900 bg-slate-950 p-3 flex gap-2 items-start">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-300 leading-normal">{res}</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}
                {roadmap.projects?.length > 0 && (
                  <SectionCard title="Project Recommendations" icon={Rocket} color="text-violet-400" className="md:col-span-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {roadmap.projects.map((proj, i) => (
                        <div key={i} className="rounded-xl border border-slate-900 bg-slate-950 p-3 flex gap-2 items-start">
                          <Rocket className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-300 leading-normal">{proj}</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}
                {roadmap.portfolio_recommendations?.length > 0 && (
                  <SectionCard title="Portfolio Recommendations" icon={Globe} color="text-emerald-400">
                    <BulletList items={roadmap.portfolio_recommendations} bulletColor="text-emerald-400" />
                  </SectionCard>
                )}
                {roadmap.internship_recommendations?.length > 0 && (
                  <SectionCard title="Internship Recommendations" icon={Briefcase} color="text-cyan-400">
                    <BulletList items={roadmap.internship_recommendations} bulletColor="text-cyan-400" />
                  </SectionCard>
                )}
              </div>
            )}

            {/* ─── TAB: CAREER ─── */}
            {activeTab === 'career' && (
              <div className="grid gap-4 md:grid-cols-2">
                {roadmap.career_path && (
                  <SectionCard title="Career Path Progression" icon={TrendingUp} color="text-indigo-400" className="md:col-span-2">
                    <p className="text-xs text-slate-300 leading-relaxed">{roadmap.career_path}</p>
                  </SectionCard>
                )}
                {roadmap.job_roles?.length > 0 && (
                  <SectionCard title="Job Role Recommendations" icon={Users} color="text-violet-400">
                    <BulletList items={roadmap.job_roles} bullet="→" bulletColor="text-violet-400" />
                  </SectionCard>
                )}
                {roadmap.resume_improvements?.length > 0 && (
                  <SectionCard title="Resume Improvement Suggestions" icon={FileText} color="text-emerald-400">
                    <BulletList items={roadmap.resume_improvements} bulletColor="text-emerald-400" />
                  </SectionCard>
                )}
                {roadmap.linkedin_tips?.length > 0 && (
                  <SectionCard title="LinkedIn Profile Tips" icon={Linkedin} color="text-blue-400">
                    <BulletList items={roadmap.linkedin_tips} bulletColor="text-blue-400" />
                  </SectionCard>
                )}
                {roadmap.goal_analysis && (
                  <SectionCard title="Career Goal Analysis" icon={Target} color="text-amber-400" className="md:col-span-2">
                    <p className="text-xs text-slate-300 leading-relaxed">{roadmap.goal_analysis}</p>
                  </SectionCard>
                )}
              </div>
            )}

            {/* ─── TAB: INTERVIEW TIPS ─── */}
            {activeTab === 'tips' && (
              <div className="grid gap-4 md:grid-cols-2">
                {roadmap.interview_tips?.length > 0 && (
                  <SectionCard title="Interview Preparation Tips" icon={Award} color="text-indigo-400" className="md:col-span-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {roadmap.interview_tips.map((tip, i) => (
                        <div key={i} className="rounded-xl border border-indigo-900/20 bg-indigo-950/10 p-3 flex gap-2 items-start">
                          <Lightbulb className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-300 leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}
                {roadmap.interview_preparation && (
                  <SectionCard title="Interview Roadmap" icon={Shield} color="text-emerald-400" className="md:col-span-2">
                    <p className="text-xs text-slate-300 leading-relaxed">{roadmap.interview_preparation}</p>
                  </SectionCard>
                )}

                {/* Timeline milestones */}
                <SectionCard title="Placement Timeline" icon={Clock} color="text-amber-400" className="md:col-span-2">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: '1 Month', desc: 'Foundation phase — learn core skills, complete first projects', color: 'border-indigo-900/30 bg-indigo-950/20 text-indigo-300' },
                      { label: '3 Months', desc: 'Build portfolio, apply for internships, start mock interviews', color: 'border-violet-900/30 bg-violet-950/20 text-violet-300' },
                      { label: '6 Months', desc: 'Advanced projects, target company prep, solve 200+ DSA problems', color: 'border-cyan-900/30 bg-cyan-950/20 text-cyan-300' },
                      { label: '12 Months', desc: 'Placement ready — full portfolio, certifications, interview confidence', color: 'border-emerald-900/30 bg-emerald-950/20 text-emerald-300' },
                    ].map(m => (
                      <div key={m.label} className={`rounded-xl border p-4 ${m.color}`}>
                        <span className="text-[9px] font-bold uppercase tracking-wider block mb-1">{m.label}</span>
                        <p className="text-[11px] leading-relaxed">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Coach */}
      <AIContextChat context={{ page: 'Career Guidance', domain, targetRole, company: targetCompany }} />
    </div>
  )
}

export default CareerGuidance
