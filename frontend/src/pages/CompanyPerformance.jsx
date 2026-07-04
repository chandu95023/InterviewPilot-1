import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getCompanyPerformance } from '../api/api'
import { Building2, TrendingUp, Target, BarChart2, AlertCircle } from 'lucide-react'

const CompanyPerformance = () => {
  const [performance, setPerformance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCompanyPerformance()
      .then((response) => setPerformance(response.data.company_performance || []))
      .catch(() => setError('Unable to load company performance data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Analyzing company performance...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">Company Performance Analytics</h2>
        <p className="text-xs text-slate-400 mt-1">
          Track your question-level performance for company-specific interview preparation.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-950/20 border border-red-900/30 p-4 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {performance.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {performance.map((item, index) => (
            <motion.div
              key={item.company || index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(0.2, index * 0.04) }}
              className="glass-card rounded-[2rem] p-6 border border-slate-800 bg-slate-950/40 shadow-md flex flex-col justify-between space-y-5 relative overflow-hidden"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Building2 className="w-24 h-24" />
              </div>

              <div className="space-y-4 relative z-10">
                {/* Company Name */}
                <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-950/50 border border-indigo-900/30 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-wide">{item.company}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Average Score */}
                  <div className="space-y-1.5 bg-slate-900/30 rounded-xl p-3 border border-slate-800/50">
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3" />
                      Average Score
                    </span>
                    <p className="text-xl font-bold text-white flex items-baseline gap-1">
                      {item.average_score}
                      <span className="text-[10px] text-slate-500 font-normal">/ 10</span>
                    </p>
                  </div>

                  {/* Attempts */}
                  <div className="space-y-1.5 bg-slate-900/30 rounded-xl p-3 border border-slate-800/50">
                    <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="h-3 w-3" />
                      Total Attempts
                    </span>
                    <p className="text-xl font-bold text-white flex items-baseline gap-1">
                      {item.question_attempts}
                      <span className="text-[10px] text-slate-500 font-normal">questions</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-[2rem] p-8 border border-slate-800 shadow-md text-center max-w-xl mx-auto space-y-4">
          <div className="h-14 w-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
            <BarChart2 className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="text-sm font-bold text-white">No Company Data Yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            No company-specific performance data available yet. Generate company questions and complete mock interviews to populate this dashboard.
          </p>
        </div>
      )}
    </div>
  )
}

export default CompanyPerformance
