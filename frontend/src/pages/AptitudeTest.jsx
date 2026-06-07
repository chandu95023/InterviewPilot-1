import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Award, 
  Play, 
  ChevronRight, 
  AlertCircle,
  BookOpen
} from 'lucide-react'
import { startAptitudeTest, submitAptitudeAnswers } from '../api/api'
import { Link } from 'react-router-dom'

const CATEGORIES = [
  'Quantitative Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
  'Data Interpretation'
]

const AptitudeTest = () => {
  const [category, setCategory] = useState('Quantitative Aptitude')
  const [difficulty, setDifficulty] = useState('Medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Quiz active states
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({}) // { questionIndex: answerText }
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [quizStarted, setQuizStarted] = useState(false)
  const [results, setResults] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startTimer = () => {
    setTimeLeft(300)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleStart = async () => {
    setLoading(true)
    setError('')
    setResults(null)
    setUserAnswers({})
    setCurrentIndex(0)
    try {
      const res = await startAptitudeTest({ category, difficulty })
      if (res.data && res.data.quiz && res.data.quiz.length > 0) {
        setQuizQuestions(res.data.quiz)
        setQuizStarted(true)
        startTimer()
      } else {
        setError('No questions could be compiled for this category. Please try again.')
      }
    } catch (err) {
      setError('Could not retrieve questions. Check server connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const checkAnswerMatch = (userAns, idealAns) => {
    if (!userAns) return false
    const cleanUser = userAns.trim().toLowerCase()
    const cleanIdeal = idealAns.trim().toLowerCase()
    
    // Direct match or partial containing
    return cleanIdeal.includes(cleanUser) || cleanUser.includes(cleanIdeal)
  }

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitting(true)
    
    const formattedAnswers = quizQuestions.map((q, idx) => {
      const uAns = userAnswers[idx] || ''
      const isCorrect = checkAnswerMatch(uAns, q.answer)
      return {
        question_id: q._id || q.id,
        answer_text: uAns,
        is_correct: isCorrect,
        question: q.question,
        ideal_answer: q.answer
      }
    })

    try {
      const res = await submitAptitudeAnswers({ answers: formattedAnswers })
      setResults({
        score: res.data.score,
        total: res.data.total,
        details: formattedAnswers
      })
      setQuizStarted(false)
    } catch (err) {
      setError('Submission failed. Please verify API response.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAutoSubmit = () => {
    handleSubmit()
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">Aptitude Practice</h2>
        <p className="text-xs text-slate-400 mt-1">Hone your Quantitative, Logical, Verbal, and Data Interpretation skills with timed assessments.</p>
      </div>

      {/* 1. SELECTION FORM */}
      {!quizStarted && !results && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2rem] p-8 border border-slate-800 shadow-xl max-w-2xl mx-auto space-y-6 bg-slate-950/40"
        >
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-950/80 px-3.5 py-1.5 text-xs text-indigo-300 border border-indigo-900/30">
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              Aptitude Training Sandbox
            </span>
            <h1 className="text-2xl font-bold text-white tracking-wide">Custom Quiz Generator</h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Test your logic under pressure. Choose a domain and difficulty below to generate a 5-question test with a 5-minute limit.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-950/20 border border-red-900/30 p-4 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-350">Category</label>
              <select
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-350">Difficulty</label>
              <select
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {['Easy', 'Medium', 'Hard'].map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-650 py-3.5 text-xs font-bold tracking-wide text-white hover:from-indigo-600 hover:to-violet-750 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Compiling Questions...</span>
              </>
            ) : (
              <>
                <Play className="h-4.5 w-4.5" />
                <span>Start Aptitude Test</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* 2. QUIZ ARENA */}
      {quizStarted && quizQuestions.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between bg-slate-950/30">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-400" />
              <span className="text-xs font-semibold text-white">{category} • {difficulty}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              <Clock className={`h-4 w-4 ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-indigo-400'}`} />
              <span className="text-xs font-bold text-white font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-8 border border-slate-800 shadow-xl space-y-6 bg-slate-950/40">
            <div className="flex justify-between items-center pb-3 border-b border-slate-900">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Question {currentIndex + 1} of {quizQuestions.length}</span>
              <span className="text-[10px] rounded-full bg-slate-900 px-2.5 py-0.5 text-slate-400 border border-slate-800">
                Aptitude
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white leading-relaxed">{quizQuestions[currentIndex]?.question}</h2>
              
              <div className="space-y-2 pt-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your Answer</label>
                <input
                  type="text"
                  placeholder="Type your final calculated answer here..."
                  className="w-full rounded-xl border border-slate-850 bg-slate-950 p-4 text-xs text-white placeholder-slate-650 outline-none focus:border-indigo-500 transition"
                  value={userAnswers[currentIndex] || ''}
                  onChange={(e) => setUserAnswers({ ...userAnswers, [currentIndex]: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between bg-slate-950/30">
            <div className="flex gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="rounded-xl border border-slate-850 bg-slate-950/50 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition disabled:opacity-30"
              >
                Previous
              </button>
              <button
                disabled={currentIndex === quizQuestions.length - 1}
                onClick={handleNext}
                className="rounded-xl border border-slate-850 bg-slate-950/50 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition disabled:opacity-30"
              >
                Next
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-650 to-indigo-650 px-5 py-2.5 text-xs font-bold text-white hover:scale-[1.02] transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Evaluating Answers...</span>
                </>
              ) : (
                <span>Submit & Complete Quiz</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. RESULTS SCREEN */}
      {results && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-[2rem] p-8 border border-slate-800 shadow-xl max-w-3xl mx-auto space-y-6 bg-slate-950/40"
        >
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 px-3.5 py-1.5 text-xs text-emerald-400 border border-emerald-900/40">
              <Award className="h-3.5 w-3.5" />
              Quiz Evaluation Complete
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide">Aptitude Results Breakdown</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-5 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total Score</span>
              <p className="text-4xl font-extrabold text-white mt-2">
                {results.score} / {results.total}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-5 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Accuracy Percentage</span>
              <p className="text-4xl font-extrabold text-white mt-2">
                {((results.score / (results.total || 1)) * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Question Review</h3>
            <div className="space-y-3">
              {results.details.map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-900 bg-slate-950/80 p-5 space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="text-xs font-semibold text-white leading-relaxed">Q{index + 1}: {item.question}</h4>
                    {item.is_correct ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 shrink-0 bg-emerald-950/45 px-2 py-0.5 rounded-full border border-emerald-900/40">
                        <CheckCircle className="h-3 w-3" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 shrink-0 bg-red-950/45 px-2 py-0.5 rounded-full border border-red-900/40">
                        <XCircle className="h-3 w-3" /> Incorrect
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 text-[11px] border-t border-slate-900 pt-3">
                    <div>
                      <span className="text-slate-500 font-semibold block mb-0.5">Your Response:</span>
                      <span className={item.is_correct ? 'text-emerald-450 font-mono font-bold' : 'text-red-400 font-mono font-bold'}>
                        {item.answer_text || 'No response provided.'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block mb-0.5">Ideal Solution:</span>
                      <span className="text-slate-350 font-mono font-semibold">{item.ideal_answer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => setResults(null)}
              className="w-1/2 text-center rounded-xl border border-slate-800 bg-slate-950 py-3 text-xs font-bold text-slate-350 hover:bg-slate-900/60 hover:text-white transition"
            >
              Start New Test
            </button>
            <Link
              to="/dashboard"
              className="w-1/2 text-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-650 py-3 text-xs font-bold text-white hover:from-indigo-650 hover:to-violet-750 transition flex items-center justify-center gap-1 shadow-lg shadow-indigo-500/10"
            >
              <span>Go to Dashboard</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AptitudeTest
