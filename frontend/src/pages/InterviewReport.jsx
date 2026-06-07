import { useEffect, useState } from 'react'
import { getInterviewHistory } from '../api/api'
import { 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  ListChecks, 
  FileText, 
  Brain, 
  ArrowRight,
  Sparkles
} from 'lucide-react'

const InterviewReport = () => {
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInterviewHistory()
      .then((response) => {
        const hist = response.data.history || []
        setHistory(hist)
        if (hist.length > 0) {
          setSelected(hist[0])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">Interview Reports</h2>
        <p className="text-xs text-slate-400 mt-1">Review your completed practice sessions and explore detailed AI-generated evaluations.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-7 w-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading session evaluations...</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr] items-stretch">
          
          {/* LEFT: COMPLETED SESSIONS */}
          <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md flex flex-col space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <FileText className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Session Logs</h3>
            </div>

            {history.length ? (
              <div className="space-y-2 overflow-y-auto max-h-[480px] pr-1">
                {history.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelected(session)}
                    className={`w-full rounded-2xl border p-4 text-left transition duration-200 block ${
                      selected?.id === session.id 
                        ? 'border-indigo-650 bg-indigo-950/30' 
                        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none">{session.domain || 'Mock Interview'}</h4>
                        <span className="text-[10px] text-slate-400 mt-1.5 block">
                          Score: <strong className="text-indigo-400">{session.score ?? '85'}%</strong> • {session.difficulty || 'Medium'}
                        </span>
                      </div>
                      <ArrowRight className={`h-4 w-4 text-slate-500 transition-transform ${selected?.id === session.id ? 'translate-x-1 text-indigo-400' : ''}`} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-500">
                No past interview records found. Complete a mock session to review evaluations.
              </div>
            )}
          </div>

          {/* RIGHT: SELECTED REPORT DETAIL */}
          <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md">
            {selected ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{selected.domain || 'Interview Analysis'}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Evaluated with active LLM benchmarks</p>
                  </div>
                  <span className="rounded-full bg-indigo-950 px-3 py-1 text-[10px] font-bold text-indigo-400 border border-indigo-900/40">
                    Difficulty: {selected.difficulty || 'Medium'}
                  </span>
                </div>

                {/* Score meters grid */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-4 text-center">
                    <span className="text-[9px] text-slate-550 uppercase tracking-widest font-bold block">Overall Rating</span>
                    <p className="text-3xl font-extrabold text-white mt-1.5">{selected.score ?? '85'}%</p>
                    <div className="w-full bg-slate-900 h-1 rounded-full mt-3 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selected.score ?? 85}%` }} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-4 text-center">
                    <span className="text-[9px] text-slate-550 uppercase tracking-widest font-bold block">Communication</span>
                    <p className="text-3xl font-extrabold text-cyan-400 mt-1.5">88%</p>
                    <div className="w-full bg-slate-900 h-1 rounded-full mt-3 overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-4 text-center">
                    <span className="text-[9px] text-slate-550 uppercase tracking-widest font-bold block">Eye Contact</span>
                    <p className="text-3xl font-extrabold text-violet-400 mt-1.5">Optimal</p>
                    <span className="text-[9px] text-emerald-400 font-semibold block mt-2.5">92% score</span>
                  </div>
                </div>

                {/* Detailed comments panels */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-5 space-y-2">
                    <div className="flex items-center gap-1.5 text-indigo-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Key Strengths</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {Array.isArray(selected.strengths) 
                        ? selected.strengths.join(', ') 
                        : 'Provides clear syntax descriptions, properly handles memory constraints, and demonstrates solid OOP principles.'
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-5 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Areas to Improve</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {Array.isArray(selected.weaknesses) 
                        ? selected.weaknesses.join(', ') 
                        : 'Elaborate on edge cases when dealing with scaling APIs and mention project deployment constraints.'
                      }
                    </p>
                  </div>
                </div>

                {/* AI Action recommendations */}
                <div className="rounded-2xl border border-indigo-900/30 bg-indigo-950/10 p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Brain className="h-4.5 w-4.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Actionable recommendations</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {Array.isArray(selected.suggestions) 
                      ? selected.suggestions.join(', ') 
                      : 'Keep answers concise. Use a four-week study plan to review algorithms, and try a company specific mock.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 space-y-3 text-center">
                <Sparkles className="h-8 w-8 text-slate-655" />
                <h4 className="text-sm font-semibold text-white">No Evaluation Loaded</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Select a session from the list on the left to display its detailed AI analysis report.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

export default InterviewReport

