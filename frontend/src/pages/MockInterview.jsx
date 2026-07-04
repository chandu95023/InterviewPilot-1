import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  ChevronRight,
  Mic,
  MicOff,
  Clock,
  AlertCircle,
  Eye,
  Activity,
  CheckSquare,
  TrendingUp,
  Award,
  Sparkles,
  Cpu,
  Keyboard,
  WifiOff,
  ShieldAlert,
  CheckCircle,
  Radio,
  ChevronDown,
  BarChart2,
  XCircle,
  Lightbulb,
  FileText,
} from 'lucide-react'
import { evaluateInterview, getDomains, generateQuestions } from '../api/api'
import AIContextChat from '../components/AIContextChat'
import { Link } from 'react-router-dom'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

const ALL_DOMAINS = [
  'Python', 'Java', 'JavaScript', 'React', 'Node.js',
  'SQL', 'DSA', 'OOPs', 'DBMS', 'Operating Systems',
  'Computer Networks', 'System Design',
]
const difficultyOptions = ['Easy', 'Medium', 'Hard']

/* ─── Browser compatibility banner ─── */
const BrowserBanner = ({ browser, supported }) => {
  if (supported) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 flex items-start gap-3"
    >
      <WifiOff className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="text-xs font-bold text-amber-300">
          {browser === 'Firefox' ? 'Firefox Detected — Voice Mode Unavailable' : 'Voice Input Not Available'}
        </p>
        <p className="text-[10px] text-amber-400/80 leading-relaxed">
          {browser === 'Firefox'
            ? 'Firefox does not support the Web Speech API. Type your answers — all AI evaluation features remain fully functional.'
            : 'Your browser does not support Speech Recognition. Use Chrome or Edge for voice, or type your answers.'}
        </p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400"><CheckCircle className="h-3 w-3" /> Chrome ✓</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400"><CheckCircle className="h-3 w-3" /> Edge ✓</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-red-950/40 border border-red-900/30 px-2 py-0.5 text-[9px] font-bold text-red-400">Firefox — Text Only</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Mic status badge ─── */
const MicStatusBadge = ({ status, error }) => {
  if (!error && status === 'idle') return null
  const cfg = {
    requesting: { cls: 'text-amber-400 border-amber-900/40 bg-amber-950/20', icon: <Radio className="h-3.5 w-3.5 animate-pulse" />, label: 'Requesting mic access…' },
    active:     { cls: 'text-emerald-400 border-emerald-900/40 bg-emerald-950/20', icon: <Mic className="h-3.5 w-3.5" />, label: 'Microphone active' },
    denied:     { cls: 'text-red-400 border-red-900/40 bg-red-950/20', icon: <ShieldAlert className="h-3.5 w-3.5" />, label: 'Mic access denied' },
    error:      { cls: 'text-red-400 border-red-900/40 bg-red-950/20', icon: <AlertCircle className="h-3.5 w-3.5" />, label: error || 'Mic error' },
  }
  const c = cfg[status]
  if (!c) return null
  return (
    <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${c.cls}`}>
      <span className="shrink-0 mt-0.5">{c.icon}</span>
      <span className="leading-relaxed">{error || c.label}</span>
    </div>
  )
}

/* ─── Mic button ─── */
const MicButton = ({ supported, isRecording, micStatus, onToggle }) => {
  const disabled = !supported || micStatus === 'denied'
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      title={!supported ? 'Voice not supported in this browser' : isRecording ? 'Stop recording' : 'Start voice input'}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold border transition disabled:opacity-40 disabled:cursor-not-allowed ${
        isRecording
          ? 'bg-red-950/20 border-red-900/40 text-red-400 hover:bg-red-950/40'
          : disabled
          ? 'bg-slate-900/20 border-slate-800 text-slate-600'
          : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:text-white hover:border-indigo-700'
      }`}
    >
      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      <span>
        {!supported ? 'Voice Unavailable'
          : micStatus === 'requesting' ? 'Requesting Mic…'
          : isRecording ? 'Stop Recording'
          : 'Start Voice Input'}
      </span>
      {isRecording && <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />}
    </button>
  )
}

/* ─── Score ring ─── */
const ScoreRing = ({ score, max = 10 }) => {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 75 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171'
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r="32" fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="40" cy="40" r="32" fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 201} 201`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-extrabold text-white">{score}</p>
        <p className="text-[9px] text-slate-500 uppercase tracking-widest">/ {max}</p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   Main MockInterview Component
════════════════════════════════════════ */
const MockInterview = () => {
  /* Config */
  const [domains, setDomains] = useState(ALL_DOMAINS)
  const [selectedDomain, setSelectedDomain] = useState('Python')
  const [difficulty, setDifficulty] = useState('Medium')
  const [questionCount, setQuestionCount] = useState(5)

  /* Interview state */
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isStarted, setIsStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timer, setTimer] = useState(0)

  /* Camera */
  const [streamActive, setStreamActive] = useState(false)
  const videoRef = useRef(null)
  const timerRef = useRef(null)

  /* Biometrics (simulated) */
  const [confidence, setConfidence] = useState(85)
  const [eyeContact, setEyeContact] = useState('Optimal')
  const [speakingSpeed, setSpeakingSpeed] = useState(135)

  /* Result */
  const [result, setResult] = useState(null)
  const [evaluating, setEvaluating] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState(null)

  /* ── Speech Recognition ── */
  const handleTranscript = useCallback((text) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: (prev[currentIndex] || '') + text,
    }))
    setConfidence((p) => Math.min(100, Math.max(75, p + (Math.random() * 6 - 3))))
    setSpeakingSpeed(() => Math.floor(120 + Math.random() * 30))
  }, [currentIndex])

  const {
    isRecording,
    micError,
    micStatus,
    liveTranscript,
    startRecording,
    stopRecording,
    resetRecognition,
    resetMicError,
    browserSupport,
  } = useSpeechRecognition({ onTranscript: handleTranscript })

  /* ── Load domains ── */
  useEffect(() => {
    getDomains()
      .then((r) => setDomains(r.data.domains?.length ? r.data.domains : ALL_DOMAINS))
      .catch(() => setDomains(ALL_DOMAINS))
    return () => { stopTimer(); stopCamera() }
  }, [])

  /* ── Reset recognition on question change ── */
  useEffect(() => {
    resetRecognition()
  }, [currentIndex])

  /* ── Timer ── */
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimer((p) => p + 1)
      if (Math.random() > 0.87) {
        setEyeContact(Math.random() > 0.5 ? 'Looking Away' : 'Distracted')
        setTimeout(() => setEyeContact('Optimal'), 1500)
      }
    }, 1000)
  }
  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current) }

  /* ── Camera ── */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStreamActive(true)
      }
    } catch (_) { /* Camera optional */ }
  }
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop())
      setStreamActive(false)
    }
  }

  /* ── Start session ── */
  const handleStartSession = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await generateQuestions({ domain: selectedDomain, difficulty, count: questionCount })
      const qs = response.data.questions || []
      if (qs.length > 0) {
        setQuestions(qs)
        setIsStarted(true)
        setCurrentIndex(0)
        setTimer(0)
        setAnswers({})
        setResult(null)
        startTimer()
        startCamera()
      } else {
        setError('No questions returned from AI. Please try again.')
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || ''
      if (msg.toLowerCase().includes('gemini') || err?.response?.status === 503) {
        setError('Gemini AI is currently unavailable. The interview will proceed with curated questions.')
        // Retry to get fallback questions
        try {
          const retry = await generateQuestions({ domain: selectedDomain, difficulty, count: questionCount })
          const qs = retry.data.questions || []
          if (qs.length > 0) {
            setQuestions(qs)
            setIsStarted(true)
            setCurrentIndex(0)
            setTimer(0)
            setAnswers({})
            setResult(null)
            startTimer()
            startCamera()
            setError('')
          }
        } catch (_) {
          setError('Unable to load questions. Please verify your API connection and try again.')
        }
      } else {
        setError('Unable to load questions. Please verify your API connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  /* ── Toggle mic ── */
  const handleToggleMic = () => {
    if (!browserSupport.supported) return
    if (isRecording) { stopRecording() } else { resetMicError(); startRecording() }
  }

  /* ── Next question ── */
  const handleNextQuestion = () => {
    if (isRecording) stopRecording()
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((p) => p + 1)
    }
  }

  /* ── End & evaluate ── */
  const handleEndInterview = async () => {
    stopTimer()
    stopCamera()
    if (isRecording) stopRecording()
    setEvaluating(true)
    setError('')

    const formattedAnswers = questions.map((item, idx) => ({
      question_id: item.id,
      question: item.question,
      answer: answers[idx] || 'No response provided.',
    }))

    try {
      const response = await evaluateInterview({ domain: selectedDomain, difficulty, answers: formattedAnswers })
      setResult(response.data)
      setIsStarted(false)
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || ''
      if (msg.toLowerCase().includes('gemini') || err?.response?.status === 503) {
        setError('AI evaluation is temporarily unavailable. Your answers have been saved. Please try evaluating again shortly.')
      } else {
        setError('Evaluation failed. Please try again.')
      }
      setEvaluating(false)
      return
    }
    setEvaluating(false)
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const readinessScore = result
    ? Math.min(100, Math.round((result.average_score ?? result.score ?? 0) * 10))
    : 0

  return (
    <div className="space-y-5">

      {/* ── 1. CONFIGURATION ── */}
      {!isStarted && !result && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2rem] p-8 border border-slate-800 shadow-xl max-w-2xl mx-auto space-y-6"
        >
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-950/80 px-3.5 py-1.5 text-xs text-indigo-300 border border-indigo-900/30">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Configure Interview Arena
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">Interactive AI Assessment</h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Choose your domain and difficulty, then speak or type your answers for Gemini AI evaluation.
            </p>
          </div>

          {/* Browser banner */}
          <BrowserBanner browser={browserSupport.browser} supported={browserSupport.supported} />

          {/* Error state */}
          {error && (
            <div className="rounded-xl bg-red-950/20 border border-red-900/30 p-4 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Domain + Difficulty + Count */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Knowledge Domain</label>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                {domains.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Difficulty Level</label>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {difficultyOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Number of Questions: <span className="text-indigo-400">{questionCount}</span></label>
            <input
              type="range" min={3} max={10} value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[9px] text-slate-600">
              <span>3 (Quick)</span><span>10 (Full)</span>
            </div>
          </div>

          {/* Input mode info */}
          <div className="flex gap-3 text-[10px] flex-wrap">
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-2 border ${browserSupport.supported ? 'border-emerald-900/30 bg-emerald-950/20 text-emerald-400' : 'border-slate-800 bg-slate-900/40 text-slate-600'}`}>
              <Mic className="h-3 w-3" />
              {browserSupport.supported ? `Voice — ${browserSupport.browser} ✓` : 'Voice — Not Available'}
            </div>
            <div className="flex items-center gap-1.5 rounded-lg px-3 py-2 border border-indigo-900/30 bg-indigo-950/20 text-indigo-400">
              <Keyboard className="h-3 w-3" />
              Text Input — Always Available
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartSession}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3.5 text-xs font-bold tracking-wide text-white hover:from-indigo-600 hover:to-violet-700 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Generating Questions via Gemini AI…</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Begin Assessment Session</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* ── 2. INTERVIEW ARENA ── */}
      {isStarted && questions.length > 0 && (
        <div className="space-y-4">
          {/* Mic error banner */}
          <AnimatePresence>
            {micError && (
              <motion.div key="micerr" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <MicStatusBadge status={micStatus} error={micError} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Evaluating overlay */}
          <AnimatePresence>
            {evaluating && (
              <motion.div
                key="evaluating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md"
              >
                <div className="glass-card rounded-[2rem] p-10 border border-indigo-900/40 shadow-2xl text-center space-y-4 max-w-sm">
                  <div className="h-16 w-16 mx-auto rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                  <h3 className="text-lg font-bold text-white">Gemini AI is Evaluating</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">Analyzing your {questions.length} answers, generating feedback, strengths, and readiness score…</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error banner during interview */}
          {error && (
            <div className="rounded-xl bg-red-950/20 border border-red-900/30 p-3 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-[1fr_1.8fr_1fr] items-stretch">

            {/* LEFT — Question + Text Answer */}
            <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Q {currentIndex + 1} / {questions.length}
                  </span>
                  <span className="text-[10px] rounded-full bg-indigo-950 px-2.5 py-0.5 text-indigo-400 border border-indigo-900/40">
                    {difficulty}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                  {selectedDomain}
                </span>
                <h2 className="text-sm font-semibold text-white leading-relaxed">
                  {questions[currentIndex]?.question}
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Keyboard className="h-3 w-3" /> Text Answer
                  </span>
                  {!browserSupport.supported && (
                    <span className="text-amber-400 text-[9px] font-semibold">Voice unavailable</span>
                  )}
                  {browserSupport.supported && isRecording && (
                    <span className="text-red-400 animate-pulse text-[9px]">● Dictating…</span>
                  )}
                </div>
                <textarea
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none"
                  rows={6}
                  placeholder={browserSupport.supported ? 'Type here or use voice input…' : 'Type your answer here…'}
                  value={answers[currentIndex] || ''}
                  onChange={(e) => setAnswers({ ...answers, [currentIndex]: e.target.value })}
                />
              </div>
            </div>

            {/* CENTER — Camera + Transcript */}
            <div className="flex flex-col gap-5">
              <div className="glass-card rounded-[2rem] border border-slate-800 shadow-md overflow-hidden relative min-h-[260px] flex items-center justify-center bg-slate-950">
                {streamActive ? (
                  <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover rounded-[2rem]" />
                ) : (
                  <div className="flex flex-col items-center space-y-4 text-center z-10">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center p-0.5 animate-pulse">
                      <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center">
                        <Cpu className="h-8 w-8 text-indigo-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">AI Coach (Gemini)</h4>
                      <p className="text-[10px] text-indigo-400 font-medium tracking-wide uppercase mt-0.5">Listening…</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold text-white tracking-wider font-mono">{formatTime(timer)}</span>
                </div>
                {isRecording && (
                  <div className="absolute top-4 right-4 bg-red-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-red-900/40 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                    <span className="text-[9px] uppercase font-bold text-red-400 tracking-wider">Listening</span>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider">Evaluation Active</span>
                </div>
              </div>

              {/* Transcript panel */}
              <div className="glass-card rounded-[2rem] p-5 border border-slate-800 shadow-md flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    {browserSupport.supported ? 'Live Speech Transcript' : 'Text Answer Preview'}
                  </span>
                  {isRecording && (
                    <span className="flex items-center gap-1 text-[9px] text-red-400 font-bold uppercase tracking-wider animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Recording
                    </span>
                  )}
                </div>
                <div className="rounded-xl border border-slate-900 bg-slate-950/50 p-4 min-h-[80px] max-h-32 overflow-y-auto text-xs leading-relaxed text-slate-300 font-mono">
                  {isRecording && liveTranscript ? (
                    <span className="text-indigo-300 italic">{liveTranscript}</span>
                  ) : answers[currentIndex] ? (
                    answers[currentIndex]
                  ) : (
                    <span className="text-slate-600">
                      {browserSupport.supported
                        ? 'Click "Start Voice Input" to begin dictating, or type your answer.'
                        : 'Type your answer in the text area above.'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT — Biometrics */}
            <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md space-y-5 flex flex-col justify-between">
              <div className="space-y-5">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Real-time Biometrics</span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400 flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-indigo-400" /> Confidence</span>
                    <span className="text-white">{Math.round(confidence)}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${confidence}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400 flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-cyan-400" /> Speed</span>
                    <span className="text-white">{speakingSpeed} WPM</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (speakingSpeed / 200) * 100)}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400 flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-violet-400" /> Gaze</span>
                    <span className={eyeContact === 'Optimal' ? 'text-emerald-400' : 'text-amber-400'}>{eyeContact}</span>
                  </div>
                </div>
                <MicStatusBadge status={micStatus} error={null} />
              </div>
              {/* Waveform */}
              <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 flex flex-col items-center gap-2">
                <div className="flex gap-1 h-6 items-end">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-200 ${isRecording ? 'bg-indigo-400' : 'bg-slate-700'}`}
                      style={{ height: isRecording ? `${25 + Math.sin(Date.now() / 200 + i) * 50 + 25}%` : '20%' }}
                    />
                  ))}
                </div>
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                  {isRecording ? 'Audio Active' : browserSupport.supported ? 'Mic Idle' : 'Mic Unavailable'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <MicButton supported={browserSupport.supported} isRecording={isRecording} micStatus={micStatus} onToggle={handleToggleMic} />
            <div className="flex gap-3 flex-wrap">
              {currentIndex < questions.length - 1 && (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  <span>Next Question</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleEndInterview}
                disabled={evaluating}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:scale-[1.02] transition disabled:opacity-50"
              >
                <CheckSquare className="h-4 w-4" />
                <span>End &amp; Evaluate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. RESULTS ── */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-5 max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="glass-card rounded-[2rem] p-8 border border-slate-800 shadow-xl text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 px-3.5 py-1.5 text-xs text-emerald-400 border border-emerald-900/40">
              <Award className="h-3.5 w-3.5" /> Assessment Complete
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide">AI Feedback Summary</h2>
            <p className="text-xs text-slate-400">Domain: <span className="text-indigo-400 font-bold">{selectedDomain}</span> · Difficulty: <span className="text-indigo-400 font-bold">{difficulty}</span></p>
          </div>

          {/* Score row */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Readiness Score */}
            <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col items-center gap-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Readiness Score</span>
              <ScoreRing score={readinessScore} max={100} />
              <span className={`text-xs font-bold ${readinessScore >= 75 ? 'text-emerald-400' : readinessScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {readinessScore >= 75 ? '🔥 Interview Ready' : readinessScore >= 50 ? '📈 Getting There' : '📚 Needs Practice'}
              </span>
            </div>

            {/* Avg per-question score */}
            <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col items-center gap-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Avg Answer Score</span>
              <ScoreRing score={Number((result.average_score ?? result.score ?? 0).toFixed(1))} max={10} />
              <span className="text-xs font-bold text-slate-300">out of 10.0</span>
            </div>

            {/* Questions Answered */}
            <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Questions Answered</span>
              <p className="text-5xl font-extrabold text-white">{result.summary?.length ?? questions.length}</p>
              <span className="text-xs text-slate-400">of {questions.length} total</span>
            </div>
          </div>

          {/* Strengths, Weaknesses, Suggestions */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-card rounded-2xl border border-emerald-900/30 bg-emerald-950/10 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Strengths</span>
              </div>
              <ul className="space-y-1.5">
                {(result.strengths?.length ? result.strengths : ['Well-structured responses', 'Clear technical definitions']).map((s, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5 shrink-0">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl border border-red-900/30 bg-red-950/10 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-[10px] text-red-400 uppercase tracking-widest font-bold">Weaknesses</span>
              </div>
              <ul className="space-y-1.5">
                {(result.weaknesses?.length ? result.weaknesses : ['Elaborate on edge cases', 'Add quantifiable examples']).map((w, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5 shrink-0">•</span>{w}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl border border-amber-900/30 bg-amber-950/10 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Suggestions</span>
              </div>
              <ul className="space-y-1.5">
                {(result.suggestions?.length ? result.suggestions : ['Use the STAR method for behavioral answers']).map((s, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-amber-400 mt-0.5 shrink-0">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Per-question breakdown */}
          {result.summary?.length > 0 && (
            <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">Per-Question Breakdown</span>
              </div>
              <div className="space-y-2">
                {result.summary.map((item, i) => (
                  <div key={i} className="rounded-xl border border-slate-800 overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-900/40 transition"
                      onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-extrabold border ${item.score >= 7 ? 'border-emerald-900/40 bg-emerald-950/30 text-emerald-400' : item.score >= 5 ? 'border-amber-900/40 bg-amber-950/30 text-amber-400' : 'border-red-900/40 bg-red-950/30 text-red-400'}`}>
                          {i + 1}
                        </span>
                        <span className="text-xs text-slate-300 truncate">{item.question}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className={`text-xs font-bold ${item.score >= 7 ? 'text-emerald-400' : item.score >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                          {item.score}/10
                        </span>
                        <ChevronDown className={`h-4 w-4 text-slate-500 transition ${expandedQuestion === i ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedQuestion === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 border-t border-slate-800/50 grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1"><FileText className="h-3 w-3" /> Your Answer</span>
                              <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/40 rounded-lg p-3">{item.given_answer || 'No response provided.'}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Ideal Answer</span>
                              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 rounded-lg p-3">{item.evaluation?.ideal_answer || 'N/A'}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => { setResult(null); setIsStarted(false) }}
              className="w-1/2 rounded-xl border border-slate-800 bg-slate-950 py-3 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              Practice Again
            </button>
            <Link
              to="/dashboard"
              className="w-1/2 text-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-xs font-bold text-white flex items-center justify-center gap-1 shadow-lg shadow-indigo-500/10 hover:from-indigo-600 hover:to-violet-700 transition"
            >
              <span>Go to Dashboard</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      )}
      {/* Floating AI Coach */}
      <AIContextChat context={{ page: 'Mock Interview', domain: selectedDomain, difficulty, currentQuestion: questions[currentIndex]?.question || '' }} />
    </div>
  )
}

export default MockInterview
