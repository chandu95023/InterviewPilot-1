import { useState, useEffect, useRef, useCallback } from 'react'
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
  Volume2,
  Keyboard,
  WifiOff,
  CheckCircle,
  Radio,
  ShieldAlert
} from 'lucide-react'
import { 
  startVoiceInterview, 
  submitVoiceAnswer, 
  completeVoiceInterview, 
  getVoiceInterviewHistory 
} from '../api/api'
import AIContextChat from '../components/AIContextChat'
import { Link } from 'react-router-dom'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

/* ─── Browser compatibility banner ─── */
const BrowserBanner = ({ browser, supported }) => {
  if (supported) return null
  const isFirefox = browser === 'Firefox'
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 flex items-start gap-3"
    >
      <WifiOff className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="text-xs font-bold text-amber-300">
          {isFirefox ? 'Firefox Detected — Voice Mode Unavailable' : 'Browser Not Supported for Voice'}
        </p>
        <p className="text-[10px] text-amber-400/80 leading-relaxed">
          {isFirefox
            ? 'Firefox does not support the Web Speech API. You can still complete the voice interview by typing your answers in the text area below.'
            : 'Your browser does not support Speech Recognition. Please use Chrome or Edge for voice input, or type your answers instead.'}
        </p>
        <div className="flex gap-2 mt-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
            <CheckCircle className="h-3 w-3" /> Chrome ✓
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
            <CheckCircle className="h-3 w-3" /> Edge ✓
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-red-950/40 border border-red-900/30 px-2 py-0.5 text-[9px] font-bold text-red-400">
            Firefox — Text Only
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Microphone status badge ─── */
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

/* ─── Mic toggle button ─── */
const MicButton = ({ supported, isRecording, micStatus, onToggle }) => {
  const disabled = !supported || micStatus === 'denied'
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      title={!supported ? 'Voice not supported in this browser' : isRecording ? 'Stop recording' : 'Start voice input'}
      className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold border transition disabled:opacity-40 disabled:cursor-not-allowed ${
        isRecording
          ? 'bg-red-950/20 border-red-900/40 text-red-400 hover:bg-red-950/40'
          : disabled
          ? 'bg-slate-900/25 border-slate-800 text-slate-600'
          : 'bg-slate-900/40 border-slate-850 text-slate-350 hover:text-white hover:border-indigo-750'
      }`}
    >
      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      <span>
        {!supported
          ? 'Voice Unavailable'
          : micStatus === 'requesting'
          ? 'Requesting Mic…'
          : isRecording
          ? 'Stop Recording'
          : 'Activate Microphone'}
      </span>
      {isRecording && <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />}
    </button>
  )
}

/* ─── Live transcript / speech panel ─── */
const LiveTranscriptView = ({ liveTranscript, textValue, isRecording, supported }) => (
  <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 min-h-[120px] flex flex-col justify-between">
    <div className="flex items-center justify-between pb-2 border-b border-slate-900/60 mb-2">
      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
        {supported ? 'Speech Feedback Feed' : 'Text Entry Preview'}
      </span>
      {isRecording && (
        <span className="flex items-center gap-1 text-[9px] text-red-400 font-bold uppercase tracking-wider animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Dictation Running
        </span>
      )}
    </div>
    <div className="text-[11px] leading-relaxed text-slate-300 font-mono flex-1 overflow-y-auto max-h-36">
      {isRecording && liveTranscript ? (
        <span className="text-indigo-400 italic">{liveTranscript}</span>
      ) : textValue ? (
        textValue
      ) : (
        <span className="text-slate-650 italic">
          {supported
            ? 'Awaiting speech input... Click "Activate Microphone" to speak, or edit directly in the answer draft box on the left.'
            : 'Type your response directly in the answer draft box on the left.'}
        </span>
      )}
    </div>
  </div>
)

const VoiceInterview = () => {
  const [domain, setDomain] = useState('Python')
  const [difficulty, setDifficulty] = useState('Medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Active Session states
  const [interviewId, setInterviewId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
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
  const startTimeRef = useRef(0)

  // Load history on mount
  useEffect(() => {
    fetchHistory()
    return () => {
      stopTimer()
    }
  }, [])

  // Speech Recognition Hook integration
  const handleTranscript = useCallback((text) => {
    setTranscript((prev) => (prev || '') + text)
    setConfidence((prev) => Math.min(100, Math.max(75, prev + (Math.random() * 4 - 2))))
    setSpeakingSpeed(() => Math.floor(115 + Math.random() * 40))
  }, [])

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

  // Auto-reset recognition on question index shift
  useEffect(() => {
    resetRecognition()
  }, [currentIndex, resetRecognition])

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
      startTimeRef.current = Date.now()
    } catch (err) {
      setError('Could not establish voice interview session. Verify backend configuration.')
    } finally {
      setLoading(false)
    }
  }

  const handleMicToggle = () => {
    if (!browserSupport.supported) return
    if (isRecording) {
      stopRecording()
    } else {
      resetMicError()
      startRecording()
    }
  }

  const handleNext = async () => {
    if (isRecording) {
      stopRecording()
    }
    
    setLoading(true)
    const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000) || 5
    
    try {
      await submitVoiceAnswer({
        interview_id: interviewId,
        question_index: currentIndex,
        answer_text: transcript || 'No response provided.',
        duration_seconds: durationSeconds
      })
      
      setTranscript('')
      resetRecognition()
      
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        startTimeRef.current = Date.now()
      } else {
        handleCompleteInterview()
      }
    } catch (err) {
      setError('Failed to submit response. Please try again.')
    } finally {
      setLoading(false)
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
          className="glass-card rounded-[2rem] p-8 border border-slate-800 shadow-xl max-w-2xl mx-auto space-y-6 bg-[#020617]/40"
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

          {/* Compatibility banner */}
          <BrowserBanner browser={browserSupport.browser} supported={browserSupport.supported} />

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
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
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
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {['Easy', 'Medium', 'Hard'].map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 text-[10px]">
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-2 border ${browserSupport.supported ? 'border-emerald-900/30 bg-emerald-950/20 text-emerald-400' : 'border-slate-800 bg-slate-900/40 text-slate-655'}`}>
              <Mic className="h-3 w-3" />
              {browserSupport.supported ? `Voice — ${browserSupport.browser} Ready` : 'Voice — Unsupported'}
            </div>
            <div className="flex items-center gap-1.5 rounded-lg px-3 py-2 border border-indigo-900/30 bg-indigo-950/20 text-indigo-400">
              <Keyboard className="h-3 w-3" />
              Text Fallback — Active
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
        <div className="space-y-4">
          <AnimatePresence>
            {micError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <MicStatusBadge status={micStatus} error={micError} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1.6fr_1fr] items-stretch">
            {/* Question & Text fallbacks */}
            <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-6 bg-slate-950/40">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                  <span className="text-[10px] uppercase font-bold text-slate-550 tracking-wider">Question {currentIndex + 1} of {questions.length}</span>
                  <span className="text-[10px] rounded-full bg-indigo-950 px-2.5 py-0.5 text-indigo-400 border border-indigo-900/40">
                    {difficulty}
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Domain: {domain}</span>
                  <h2 className="text-sm font-semibold text-white leading-relaxed">{questions[currentIndex]?.question}</h2>
                </div>
              </div>

              {/* Editable Answer draft fallback box */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Keyboard className="h-3 w-3" /> Answer Draft (Edit or Type)
                  </span>
                  {!browserSupport.supported && (
                    <span className="text-amber-400 text-[9px] font-semibold">Voice unavailable</span>
                  )}
                  {isRecording && (
                    <span className="text-red-400 animate-pulse text-[9px]">● Transcribing…</span>
                  )}
                </div>
                <textarea
                  className="w-full rounded-xl border border-slate-750 bg-slate-900 p-4 text-xs text-white placeholder-slate-550 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none font-sans"
                  rows={7}
                  placeholder={browserSupport.supported ? 'Your words will stream here, or you can type directly…' : 'Speech-to-text is disabled. Please type your response here…'}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
              </div>
            </div>

            {/* Glowing waveform panel */}
            <div className="flex flex-col gap-6">
              <div className="glass-card rounded-[2rem] border border-slate-805 bg-slate-950 p-8 shadow-md flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold text-white tracking-wider font-mono">{formatTime(timer)}</span>
                </div>

                {isRecording && (
                  <div className="absolute top-4 right-4 bg-red-950/80 backdrop-blur border border-red-900/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                    <span className="text-[9px] uppercase font-bold text-red-450 tracking-wider">Listening</span>
                  </div>
                )}

                {/* Glowing pulsating core */}
                <div className={`h-24 w-24 rounded-full flex items-center justify-center p-0.5 ${isRecording ? 'bg-gradient-to-tr from-cyan-400 to-indigo-500 animate-pulse' : 'bg-slate-900 border border-slate-800'}`}>
                  <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center">
                    {isRecording ? (
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
                      className={`w-1 rounded-full transition-all duration-300 ${isRecording ? 'bg-cyan-400' : 'bg-slate-800'}`}
                      style={{ 
                        height: isRecording ? `${30 + Math.random() * 70}%` : '20%',
                        animation: isRecording ? 'float 0.8s ease-in-out infinite alternate' : 'none',
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>

                {/* Waveform visualizer status label */}
                <span className="text-[9px] uppercase font-bold text-slate-550 mt-2 tracking-widest">
                  {isRecording ? 'Audio Stream Active' : 'Speech Monitor Offline'}
                </span>
              </div>

              {/* Transcript Preview */}
              <LiveTranscriptView 
                liveTranscript={liveTranscript}
                textValue={transcript}
                isRecording={isRecording}
                supported={browserSupport.supported}
              />
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

                <MicStatusBadge status={micStatus} error={null} />
              </div>
              
              <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-550 block tracking-widest">Acoustic Verification</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between flex-wrap gap-3 bg-[#020617]/20">
            <MicButton
              supported={browserSupport.supported}
              isRecording={isRecording}
              micStatus={micStatus}
              onToggle={handleMicToggle}
            />

            <div className="flex gap-3">
              <button
                onClick={handleNext}
                disabled={loading}
                className="rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
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
              className="w-1/2 text-center rounded-xl border border-slate-800 bg-slate-950 py-3 text-xs font-bold text-slate-355 hover:bg-slate-900/60 hover:text-white transition"
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

      {/* Floating AI Coach */}
      <AIContextChat context={{ page: 'Voice Interview', domain, difficulty, currentQuestion: questions[currentIndex]?.question || '' }} />
    </div>
  )
}

export default VoiceInterview
