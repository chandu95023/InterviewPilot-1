import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  MapPin, 
  BookOpen, 
  Trophy, 
  Clock, 
  AlertCircle, 
  HelpCircle,
  TrendingUp,
  Award,
  ChevronRight,
  Compass
} from 'lucide-react'
import { generateStudyPlan } from '../api/api'
import { Link } from 'react-router-dom'

const CareerGuidance = () => {
  const [targetRole, setTargetRole] = useState('Full Stack Engineer')
  const [domain, setDomain] = useState('Full Stack Development')
  const [currentLevel, setCurrentLevel] = useState('Intermediate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roadmap, setRoadmap] = useState(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setRoadmap(null)
    try {
      const response = await generateStudyPlan({
        domain,
        current_level: currentLevel,
        target_role: targetRole,
        weak_topics: []
      })
      
      if (response.data && response.data.study_plan) {
        setRoadmap(response.data.study_plan)
      } else {
        setError('Failed to generate career roadmap. Please try again.')
      }
    } catch (err) {
      setError('Could not establish connection to roadmap planner API.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">AI Career Guidance</h2>
        <p className="text-xs text-slate-400 mt-1">Map out structured technical milestones, resources, and growth paths matching your target roles.</p>
      </div>

      {/* 1. INPUT CONFIG */}
      {!roadmap && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2rem] p-8 border border-slate-800 shadow-xl max-w-2xl mx-auto space-y-6 bg-slate-950/40"
        >
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-950/80 px-3.5 py-1.5 text-xs text-indigo-300 border border-indigo-900/30">
              <Compass className="h-3.5 w-3.5 text-indigo-400" />
              Career Navigation Engine
            </span>
            <h1 className="text-2xl font-bold text-white tracking-wide">Generate Career Roadmap</h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Define your aspirations. The AI compiles structural knowledge bars, target milestones, and learning assets.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-950/20 border border-red-900/30 p-4 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-350">Aspirational Target Role</label>
              <input
                type="text"
                placeholder="e.g. Cloud DevOps Architect, Senior ML Engineer..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-650 outline-none focus:border-indigo-500 transition"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-350">Core Domain Focus</label>
                <select
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                >
                  {['Python', 'Java', 'Full Stack Development', 'Data Science', 'AI/ML'].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-350">Current Standing Level</label>
                <select
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                >
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !targetRole}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-650 py-3.5 text-xs font-bold tracking-wide text-white hover:from-indigo-600 hover:to-violet-750 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Navigating structural growth indices...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5" />
                <span>Generate Growth Timeline</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* 2. TIMELINE ROADMAP SUMMARY */}
      {roadmap && (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-stretch">
          {/* Main roadmap timeline */}
          <div className="glass-card rounded-[2rem] p-8 border border-slate-855 bg-slate-950/40 shadow-xl space-y-6">
            <div className="space-y-2 pb-4 border-b border-slate-900">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-950 px-3 py-1 text-[10px] text-indigo-400 border border-indigo-900/40 font-bold uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5" /> Target Roadmap
              </span>
              <h2 className="text-lg font-bold text-white">{roadmap.headline || `Roadmap for ${targetRole}`}</h2>
            </div>

            {/* Vertical timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-900">
              {roadmap.weekly_plan?.map((week, idx) => (
                <div key={idx} className="relative space-y-1">
                  {/* Bullet */}
                  <div className="absolute -left-6.5 top-1.5 h-3.5 w-3.5 rounded-full bg-indigo-500 border-4 border-[#020617] shadow-md shadow-indigo-500/20" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Phase {idx + 1}</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">{week}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setRoadmap(null)}
              className="mt-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-405 hover:text-white transition"
            >
              Configure Different Path
            </button>
          </div>

          {/* Learning resources checklist */}
          <div className="glass-card rounded-[2rem] p-6 border border-slate-800 bg-slate-950/40 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Learning Asset Recommendations</span>
              
              <div className="space-y-3">
                {roadmap.learning_resources?.map((res, index) => (
                  <div key={index} className="rounded-xl border border-slate-900 bg-slate-950 p-4 flex gap-3 items-start">
                    <BookOpen className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-300 font-mono leading-normal font-semibold">{res}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 text-center">
              <span className="text-[9px] uppercase font-bold text-slate-550 block tracking-widest font-mono">Endorsed by Enterprise AI</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CareerGuidance
