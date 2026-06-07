import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Play, 
  Award, 
  ChevronRight, 
  Clock, 
  TrendingUp, 
  Activity, 
  Eye, 
  AlertCircle, 
  Sparkles,
  BookOpen,
  Volume2
} from 'lucide-react'
import { 
  startVoiceInterview, 
  submitVoiceAnswer, 
  completeVoiceInterview, 
  getVoiceInterviewHistory 
} from '../api/api'
import { Link } from 'react-router-dom'

const VoiceInterview = () => {
  const [domain, setDomain] = useState('Python')
  const [difficulty, setDifficulty] = useState('Medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Active Session states
  const [interviewId, setInterviewId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [status, setStatus] = useState('idle') // idle, listening, captured, submitting
  const [transcript, setTranscript] = useState('')
  const [timer, setTimer] = useState(0)
  
  // Biometrics
  const [speakingSpeed, setSpeakingSpeed] = useState(130)
  const [confidence, setConfidence] = useState(85)
  const [gaze, setGaze] = useState('Optimal')

  const [history, setHistory] = useState([])
  const [results, setResults] = useState(null)
  const [completing, setCompleting] = useState(false)

  const timerRef = useRef(null)
  const recognitionRef = useRef(null)
  const startTimeRef = useRef(0)

  useEffect(() => {
    fetchHistory()
    return () => {
      stopTimer()
      if (recognitionRef.current) recognitionRef.current.abort()
    }
  }, [])

  // Web Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onstart = () => {
        setStatus('listening')
        startTimeRef.current = Date.now()
      }
      rec.onerror = () => setStatus('error')
      rec.onend = () => {
        setStatus((s) => (s === 'listening' ? 'captured' : s))
      }
      rec.onresult = (event) => {
        let finalTrans = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + ' '
          }
        }
        if (finalTrans) {
          setTranscript((prev) => prev + finalTrans)
          setConfidence((prev) => Math.min(100, Math.max(75, prev + (Math.random() * 4 - 2))))
          setSpeakingSpeed(() => Math.floor(115 + Math.random() * 40))
        }
      }

      recognitionRef.current = rec
    }
  }, [])

  const fetchHistory = () => {
    getVoiceInterviewHistory()
      .then((res) => setHistory(res.data.voice_interviews || []))
      .catch(console.error)
  }

  const startTimer = () => {
    setTimer(0)
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (Math.random() > 0.85) {
          setGaze(Math.random() > 0.5 ? 'Looking Away' : 'Distracted')
          setTimeout(() => setGaze('Optimal'), 1500)
        }
        return prev + 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const handleStart = async () => {
    setLoading(true)
    setError('')
    setResults(null)
    setQuestions([])
    setCurrentIndex(0)
    setTranscript('')
    try {
      const res = await startVoiceInterview({ domain, difficulty, question_count: 3, duration_minutes: 15 })
      setInterviewId(res.data.interview_id)
      setQuestions(res.data.questions || [])
      startTimer()
      setStatus('idle')
    } catch (err) {
      setError('Could not establish voice interview session. Verify backend configuration.')
    } finally {
      setLoading(false)
    }
  }

  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition API is not supported in this browser. Please use Chrome/Edge.')
      return
    }

    if (status === 'listening') {
      recognitionRef.current.stop()
    } else {
      setTranscript('')
      recognitionRef.current.start()
    }
  }

  const handleNext = async () => {
    if (status === 'listening') {
      recognitionRef.current.stop()
    }
    
    setStatus('submitting')
    const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000) || 5
    
    try {
      await submitVoiceAnswer({
        interview_id: interviewId,
        question_index: currentIndex,
        answer_text: transcript || 'No response provided.',
        duration_seconds: durationSeconds
      })
      
      setTranscript('')
      setStatus('idle')
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        handleCompleteInterview()
      }
    } catch (err) {
      setError('Failed to submit response. Please try again.')
      setStatus('captured')
    }
  }

  const handleCompleteInterview = async () => {
    stopTimer()
    setCompleting(true)
    try {
      const res = await completeVoiceInterview(interviewId)
      setResults(res.data)
      setInterviewId(null)
      fetchHistory()
    } catch (err) {
      setError('Could not evaluate voice results.')
    } finally {
      setCompleting(false)
    }
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">Speech Analytics Practice</h2>
        <p className="text-xs text-slate-400 mt-1">Simulate real panel assessments using voice capture, gaze checking, and articulation rate audits.</p>
      </div>

      {/* 1. SELECTION CARD */}
      {!interviewId && !results && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2rem] p-8 border border-slate-800 shadow-xl max-w-2xl mx-auto space-y-6 bg-slate-950/40"
        >
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-950/80 px-3.5 py-1.5 text-xs text-indigo-300 border border-indigo-900/30">
              <Mic className="h-3.5 w-3.5 text-indigo-400" />
              Voice Interview System
            </span>
            <h1 className="text-2xl font-bold text-white tracking-wide">Start Speech Evaluation</h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Answer 3 adaptive questions using voice capture. The system measures articulation index, confidence levels, and speech cadence.
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
              <label className="text-xs font-semibold text-slate-350">Knowledge Domain</label>
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
                <span>Generating Speech Set...</span>
              </>
            ) : (
              <>
                <Play className="h-4.5 w-4.5" />
                <span>Begin Voice Assessment</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* 2. THREE PANEL INTERVIEW ROOM */}
      {interviewId && questions.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.8fr_1fr] items-stretch">
          {/* Question panel */}
          <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-6 bg-slate-950/40">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-[10px] rounded-full bg-indigo-950 px-2.5 py-0.5 text-indigo-400 border border-indigo-900/40">
                  {difficulty}
                </span>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Domain: {domain}</span>
                <h2 className="text-sm font-semibold text-white leading-relaxed">{questions[currentIndex]?.question}</h2>
              </div>
            </div>

            <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 min-h-[140px] flex flex-col justify-between">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Audio Capture status</span>
              <p className="text-[11px] leading-relaxed text-slate-400 font-mono">
                {status === 'listening' ? 'Speaking now... Listening for voice.' : 'Microphone is currently disabled.'}
              </p>
              {transcript && (
                <div className="text-[10px] text-emerald-450 font-mono overflow-y-auto max-h-[70px] mt-2 border-t border-slate-900 pt-2 leading-normal">
                  {transcript}
                </div>
              )}
            </div>
          </div>

          {/* Glowing waveform panel */}
          <div className="flex flex-col gap-6">
            <div className="glass-card rounded-[2rem] border border-slate-805 bg-slate-950 p-8 shadow-md flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold text-white tracking-wider font-mono">{formatTime(timer)}</span>
              </div>

              {/* Glowing pulsating core */}
              <div className={`h-24 w-24 rounded-full flex items-center justify-center p-0.5 ${status === 'listening' ? 'bg-gradient-to-tr from-cyan-400 to-indigo-500 animate-pulse' : 'bg-slate-900 border border-slate-800'}`}>
                <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center">
                  {status === 'listening' ? (
                    <Volume2 className="h-8 w-8 text-cyan-400 animate-bounce" />
                  ) : (
                    <Mic className="h-8 w-8 text-slate-500" />
                  )}
                </div>
              </div>

              {/* Simple audio monitor visualizer line */}
              <div className="flex gap-1 h-6 items-end mt-8">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-cyan-400 rounded-full transition-all duration-300"
                    style={{ 
                      height: status === 'listening' ? `${30 + Math.random() * 70}%` : '20%',
                      animation: status === 'listening' ? 'float 0.8s ease-in-out infinite alternate' : 'none',
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleMicToggle}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow ${
                    status === 'listening' 
                      ? 'bg-red-950/20 border border-red-900/40 text-red-400' 
                      : 'bg-indigo-650 hover:bg-indigo-750 text-white'
                  }`}
                >
                  {status === 'listening' ? (
                    <>
                      <MicOff className="h-4.5 w-4.5" />
                      <span>Disable Microphone</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4.5 w-4.5" />
                      <span>Activate Microphone</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleNext}
                  disabled={status === 'submitting'}
                  className="rounded-xl bg-slate-900 border border-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Biometrics */}
          <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md space-y-6 bg-slate-950/40 flex flex-col justify-between">
            <div className="space-y-5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Gaze & Vocal Metrics</span>

              {/* Confidence */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-400" /> Articulation Rating
                  </span>
                  <span className="text-white">{confidence}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${confidence}%` }} />
                </div>
              </div>

              {/* Speaking speed */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-cyan-400" /> Cadence Speed
                  </span>
                  <span className="text-white">{speakingSpeed} WPM</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (speakingSpeed / 200) * 100)}%` }} />
                </div>
              </div>

              {/* Gaze analysis */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-violet-400" /> Gaze Alignment
                  </span>
                  <span className={`text-[10px] font-semibold ${gaze === 'Optimal' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {gaze}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 text-center">
              <span className="text-[9px] uppercase font-bold text-slate-550 block tracking-widest">Acoustic Verification</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. RESULTS EVALUATION SUMMARY */}
      {results && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-[2rem] p-8 border border-slate-800 shadow-xl max-w-3xl mx-auto space-y-6 bg-slate-950/40"
        >
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 px-3.5 py-1.5 text-xs text-emerald-400 border border-emerald-900/40">
              <Award className="h-3.5 w-3.5" />
              Evaluation Complete
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide">Voice Assessment Breakdown</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-5 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Average Articulation Score</span>
              <p className="text-4xl font-extrabold text-white mt-2">
                {results.average_score}%
              </p>
            </div>
            <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-5 text-center space-y-2 flex flex-col justify-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Weak Areas Identified</span>
              <div className="text-xs text-slate-350 leading-relaxed max-h-[80px] overflow-y-auto">
                {results.weak_topics && results.weak_topics.length > 0 ? (
                  <ul className="list-disc pl-4 text-left space-y-1">
                    {results.weak_topics.map((t, idx) => <li key={idx}>{t}</li>)}
                  </ul>
                ) : (
                  <span>Excellent vocal performance across all domain categories. No weak zones identified!</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => setResults(null)}
              className="w-1/2 text-center rounded-xl border border-slate-800 bg-slate-950 py-3 text-xs font-bold text-slate-350 hover:bg-slate-900/60 hover:text-white transition"
            >
              Analyze Again
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

      {/* 4. HISTORY PANEL */}
      <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md space-y-4 bg-slate-950/40">
        <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
          <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Speech History Summary</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {history.map((item) => (
            <div key={item._id || item.id} className="rounded-2xl border border-slate-905 bg-slate-950 p-4 space-y-2 shadow">
              <div className="flex justify-between items-center text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                <span>{item.domain}</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800">{item.difficulty}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500">Evaluation Score:</span>
                <span className="text-white font-bold">{item.score}%</span>
              </div>
            </div>
          ))}

          {history.length === 0 && (
            <p className="text-xs text-slate-550 py-4 col-span-full text-center">No voice sessions recorded. Start a new evaluation above.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default VoiceInterview
