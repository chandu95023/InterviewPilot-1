import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getInterviewHistory, getInterviewSession, deleteInterviewSession } from '../api/api'
import {
  BookOpen,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  X,
  TrendingUp,
  Target,
  Brain,
  ChevronRight,
  Award
} from 'lucide-react'

const DOMAIN_COLORS = {
  Python: 'text-yellow-400 bg-yellow-950/30 border-yellow-900/30',
  Java: 'text-orange-400 bg-orange-950/30 border-orange-900/30',
  React: 'text-cyan-400 bg-cyan-950/30 border-cyan-900/30',
  SQL: 'text-blue-400 bg-blue-950/30 border-blue-900/30',
  default: 'text-indigo-400 bg-indigo-950/30 border-indigo-900/30',
}

const getDomainColor = (domain) =>
  DOMAIN_COLORS[domain] || DOMAIN_COLORS.default

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch (_) {
    return dateStr
  }
}

const ScoreBadge = ({ score }) => {
  if (score == null) return <span className="text-[10px] text-slate-500">No score</span>
  const color =
    score >= 8 ? 'text-emerald-400' : score >= 6 ? 'text-yellow-400' : 'text-red-400'
  return (
    <span className={`text-lg font-bold ${color}`}>
      {score.toFixed(1)}
      <span className="text-[10px] text-slate-500 font-normal ml-0.5">/ 10</span>
    </span>
  )
}

const QuestionHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchHistory = () => {
    setLoading(true)
    getInterviewHistory()
      .then((res) => setHistory(res.data.history || []))
      .catch(() => setError('Unable to load interview history.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleViewSession = async (id) => {
    setSessionLoading(true)
    try {
      const res = await getInterviewSession(id)
      setSelectedSession(res.data)
    } catch {
      setError('Unable to load session details.')
    } finally {
      setSessionLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteInterviewSession(id)
      setHistory((prev) => prev.filter((s) => String(s.id) !== String(id)))
    } catch {
      setError('Failed to delete session.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading interview history...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Interview History</h2>
          <p className="text-xs text-slate-400 mt-1">
            All your mock interview sessions — view detailed results or delete old ones.
          </p>
        </div>
        <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 rounded-full px-3 py-1">
          {history.length} session{history.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div className="rounded-xl bg-red-950/20 border border-red-900/30 p-4 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-slate-950 border border-slate-800 rounded-[2rem] p-6 w-full max-w-lg shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedSession.domain} Interview</h3>
                  <p className="text-[10px] text-slate-500">{selectedSession.difficulty} • {formatDate(selectedSession.created_at)}</p>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center hover:bg-slate-800 transition"
                >
                  <X className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/50 space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wide font-semibold flex items-center gap-1">
                    <Award className="h-3 w-3" /> Final Score
                  </span>
                  <ScoreBadge score={selectedSession.score} />
                </div>
                <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/50 space-y-1">
                  <span className="text-[10px] text-indigo-400 uppercase tracking-wide font-semibold flex items-center gap-1">
                    <Target className="h-3 w-3" /> Domain
                  </span>
                  <p className="text-sm font-bold text-white">{selectedSession.domain}</p>
                </div>
              </div>

              {selectedSession.evaluation && (
                <div className="space-y-3">
                  {selectedSession.evaluation.strengths?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-emerald-400 uppercase tracking-wide font-semibold">Strengths</span>
                      <ul className="space-y-1">
                        {selectedSession.evaluation.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedSession.evaluation.suggestions?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-indigo-400 uppercase tracking-wide font-semibold">Improvement Suggestions</span>
                      <ul className="space-y-1">
                        {selectedSession.evaluation.suggestions.map((s, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {history.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {history.map((session, index) => (
            <motion.div
              key={session.id || index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(0.2, index * 0.04) }}
              className="glass-card rounded-[2rem] p-5 border border-slate-800 bg-slate-950/40 shadow-md flex flex-col gap-4"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] border font-bold uppercase tracking-wider ${getDomainColor(session.domain)}`}>
                    {session.domain}
                  </span>
                  <p className="text-[10px] text-slate-500 font-semibold">{session.difficulty}</p>
                </div>
                <ScoreBadge score={session.score} />
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                <Clock className="h-3 w-3" />
                {formatDate(session.created_at)}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-900/60">
                <button
                  onClick={() => handleViewSession(session.id)}
                  disabled={sessionLoading}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-900/30 px-3 py-2 text-[10px] font-bold text-indigo-300 transition"
                >
                  <Eye className="h-3 w-3" />
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(session.id)}
                  disabled={deletingId === session.id}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-900/30 transition"
                >
                  {deletingId === session.id ? (
                    <div className="h-3.5 w-3.5 rounded-full border border-red-400 border-t-transparent animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-[2rem] p-8 border border-slate-800 shadow-md text-center max-w-xl mx-auto space-y-4">
          <div className="h-14 w-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
            <BookOpen className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="text-sm font-semibold text-white">No Sessions Yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Complete a mock interview to start building your history. Your sessions will appear here with full score breakdowns.
          </p>
        </div>
      )}
    </div>
  )
}

export default QuestionHistory
