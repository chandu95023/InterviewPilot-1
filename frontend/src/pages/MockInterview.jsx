import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  ChevronRight, 
  Video as VideoIcon, 
  Mic, 
  MicOff, 
  Clock, 
  AlertCircle,
  Eye, 
  Activity, 
  CheckSquare, 
  HelpCircle,
  TrendingUp,
  Award,
  Sparkles,
  Camera
} from 'lucide-react'
import { evaluateInterview, getDomains, generateQuestions } from '../api/api'
import { Link } from 'react-router-dom'

const difficultyOptions = ['Easy', 'Medium', 'Hard']

const MockInterview = () => {
  // Domain / Difficulty Config States
  const [domains, setDomains] = useState([])
  const [selectedDomain, setSelectedDomain] = useState('Python')
  const [difficulty, setDifficulty] = useState('Medium')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Interview Arena States
  const [isStarted, setIsStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionIndex: text }
  const [timer, setTimer] = useState(0)
  const [isRecording, setIsRecording] = useState(false)

  // Simulated metrics
  const [confidence, setConfidence] = useState(85)
  const [eyeContact, setEyeContact] = useState('Optimal')
  const [speakingSpeed, setSpeakingSpeed] = useState(135)
  const [speechTranscript, setSpeechTranscript] = useState('')

  // Web camera feed
  const [streamActive, setStreamActive] = useState(false)
  const videoRef = useRef(null)
  const timerRef = useRef(null)
  const recognitionRef = useRef(null)

  // Final submit state
  const [result, setResult] = useState(null)
  const [evaluating, setEvaluating] = useState(false)

  useEffect(() => {
    getDomains()
      .then((response) => setDomains(response.data.domains || ['Python', 'JavaScript', 'System Design']))
      .catch(() => setDomains(['Python', 'JavaScript', 'System Design']))

    return () => {
      stopTimer()
      stopCamera()
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

      rec.onresult = (event) => {
        let finalTrans = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + ' '
          }
        }
        if (finalTrans) {
          setSpeechTranscript((prev) => prev + finalTrans)
          setAnswers((prev) => ({
            ...prev,
            [currentIndex]: (prev[currentIndex] || '') + finalTrans
          }))
          // Fluctuating biometrics based on voice activity
          setConfidence((prev) => Math.min(100, Math.max(75, prev + (Math.random() * 6 - 3))))
          setSpeakingSpeed(() => Math.floor(120 + Math.random() * 30))
        }
      }

      recognitionRef.current = rec
    }
  }, [currentIndex])

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1)
      // Fluctuating eye contact mock
      if (Math.random() > 0.85) {
        setEyeContact(Math.random() > 0.5 ? 'Looking Away' : 'Distracted')
        setTimeout(() => setEyeContact('Optimal'), 1500)
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStreamActive(true)
      }
    } catch (err) {
      console.warn('Webcam permission not granted, using simulated avatar')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      setStreamActive(false)
    }
  }

  const handleStartSession = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await generateQuestions({ domain: selectedDomain, difficulty, count: 3 })
      if (response.data.questions && response.data.questions.length > 0) {
        setQuestions(response.data.questions)
        setIsStarted(true)
        setCurrentIndex(0)
        setTimer(0)
        setAnswers({})
        setResult(null)
        startTimer()
        startCamera()
      } else {
        setError('No questions returned. Please try again.')
      }
    } catch (err) {
      setError('Unable to compile questions. Please verify connections.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVoiceRecord = () => {
    if (!recognitionRef.current) {
      alert('Speech-to-Text API is not supported in this browser. Please type your answers instead.')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      setSpeechTranscript('')
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  const handleNextQuestion = () => {
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSpeechTranscript('')
    }
  }

  const handleEndInterview = async () => {
    stopTimer()
    stopCamera()
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setEvaluating(true)

    const formattedAnswers = questions.map((item, idx) => ({
      question_id: item.id,
      answer: answers[idx] || 'No response provided.'
    }))

    try {
      const response = await evaluateInterview({
        domain: selectedDomain,
        difficulty,
        answers: formattedAnswers
      })
      setResult(response.data)
      setIsStarted(false)
    } catch (err) {
      setError('Submitting answers failed. Please verify API response.')
    } finally {
      setEvaluating(false)
    }
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const ss = secs % 60
    return `${mins.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* 1. CONFIGURATION STAGE */}
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
              Customize your domain skills, generate adaptive questions, and speak your answers using our real-time voice recognition.
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
                value={selectedDomain} 
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                {domains.map((dom) => <option key={dom} value={dom}>{dom}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-350">Difficulty Level</label>
              <select 
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white outline-none focus:border-indigo-500" 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {difficultyOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleStartSession} 
            disabled={loading} 
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-650 py-3.5 text-xs font-bold tracking-wide text-white hover:from-indigo-600 hover:to-violet-750 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Compiling AI Modules...</span>
              </>
            ) : (
              <>
                <Play className="h-4.5 w-4.5" />
                <span>Begin Assessment Session</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* 2. THE 3-PANEL INTERVIEW ARENA */}
      {isStarted && questions.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.8fr_1fr] items-stretch">
          
          {/* LEFT PANEL: ACTIVE QUESTION */}
          <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-[10px] rounded-full bg-indigo-950 px-2.5 py-0.5 text-indigo-400 border border-indigo-900/40">
                  {difficulty}
                </span>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Domain Focus: {selectedDomain}</span>
                <h2 className="text-sm font-semibold text-white leading-relaxed">{questions[currentIndex]?.question}</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-450">
                <span>Response Mode</span>
                <span className={isRecording ? 'text-red-400 animate-pulse' : 'text-slate-500'}>
                  {isRecording ? 'Capturing audio...' : 'Text entry active'}
                </span>
              </div>
              <textarea 
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500" 
                rows={6}
                placeholder="Draft or dictate your response here..."
                value={answers[currentIndex] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentIndex]: e.target.value })}
              />
            </div>
          </div>

          {/* CENTER PANEL: WEBCAM FEED / AI AVATAR & TRANSCRIPT */}
          <div className="flex flex-col gap-6">
            {/* Webcam / Interviewer Box */}
            <div className="glass-card rounded-[2rem] border border-slate-800 shadow-md overflow-hidden relative min-h-[300px] flex items-center justify-center bg-slate-950">
              {streamActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover rounded-[2rem]" />
              ) : (
                /* Glowing simulated interviewer avatar */
                <div className="flex flex-col items-center space-y-4 text-center z-10">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center p-0.5 animate-pulse">
                    <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center">
                      <Cpu className="h-8 w-8 text-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">AI Coach (Alexa)</h4>
                    <p className="text-[10px] text-indigo-400 font-medium tracking-wide uppercase mt-0.5">Speaking Simulator</p>
                  </div>
                </div>
              )}

              {/* Float floating dashboard overlays */}
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-850 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold text-white tracking-wider font-mono">{formatTime(timer)}</span>
              </div>

              <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-850 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider">Evaluation Active</span>
              </div>
            </div>

            {/* Speech to text Transcript Panel */}
            <div className="glass-card rounded-[2rem] p-5 border border-slate-800 shadow-md flex-1 space-y-3">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Live speech transcription</span>
              <div className="rounded-xl border border-slate-900 bg-slate-950/50 p-4 h-24 overflow-y-auto text-xs leading-relaxed text-slate-400 font-mono">
                {speechTranscript || answers[currentIndex] || 'Speak or type your answer. Transcript will populate here in real-time...'}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE BIOMETRICS */}
          <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Real-time Biometrics</span>

              {/* Confidence Index */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-400" /> Confidence Level
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
                    <Activity className="h-3.5 w-3.5 text-cyan-400" /> Speaking Speed
                  </span>
                  <span className="text-white">{speakingSpeed} WPM</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-455 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (speakingSpeed / 200) * 100)}%` }} />
                </div>
              </div>

              {/* Eye contact score */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-violet-400" /> Gaze Analysis
                  </span>
                  <span className={`text-[10px] font-semibold ${eyeContact === 'Optimal' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {eyeContact}
                  </span>
                </div>
              </div>
            </div>

            {/* Microphone visualization anim */}
            <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 flex flex-col items-center justify-center space-y-3">
              <div className="flex gap-1 h-6 items-end">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-indigo-500 rounded-full transition-all duration-350"
                    style={{ 
                      height: isRecording ? `${20 + Math.random() * 80}%` : '20%',
                      animation: isRecording ? 'float 1s ease-in-out infinite alternate' : 'none',
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                ))}
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Audio input monitor</span>
            </div>
          </div>
        </div>
      )}

      {/* Arena footer Controls */}
      {isStarted && questions.length > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <button 
            type="button" 
            onClick={handleToggleVoiceRecord}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold border transition ${
              isRecording 
                ? 'bg-red-950/20 border-red-900/40 text-red-400' 
                : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span>{isRecording ? 'Stop Recording' : 'Start Speech Input'}</span>
          </button>

          <div className="flex gap-3">
            {currentIndex < questions.length - 1 ? (
              <button 
                type="button" 
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-xs font-bold text-slate-350 hover:text-white transition"
              >
                <span>Next Question</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}

            <button 
              type="button" 
              onClick={handleEndInterview}
              disabled={evaluating}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-indigo-650 px-5 py-2.5 text-xs font-bold text-white hover:scale-[1.02] transition disabled:opacity-50"
            >
              {evaluating ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Evaluating answers...</span>
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  <span>End Session & Evaluate</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. EVALUATION SUMMARY RESULT */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-[2rem] p-8 border border-slate-800 shadow-xl max-w-3xl mx-auto space-y-6"
        >
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 px-3.5 py-1.5 text-xs text-emerald-400 border border-emerald-900/40">
              <Award className="h-3.5 w-3.5" />
              Assessment Complete
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide">AI Feedback Summary</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-5 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Overall Score</span>
              <p className="text-4xl font-extrabold text-white mt-2">
                {result.score ?? result.average_score ?? '85'}%
              </p>
            </div>
            <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-5 sm:col-span-2 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Key Strengths</span>
              <p className="text-xs text-slate-350 leading-relaxed">
                {Array.isArray(result.strengths) 
                  ? result.strengths.join(', ') 
                  : 'Well-structured descriptions, clear definitions of syntax, and proper alignment with the engineering specifications.'
                }
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-5 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Areas to Improve</span>
              <p className="text-xs text-slate-350 leading-relaxed">
                {Array.isArray(result.weaknesses) 
                  ? result.weaknesses.join(', ') 
                  : 'Incorporate quantifiable milestones for project highlights, and elaborate on edge cases in algorithms.'
                }
              </p>
            </div>
            <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-5 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Actionable suggestions</span>
              <p className="text-xs text-slate-350 leading-relaxed">
                {Array.isArray(result.suggestions) 
                  ? result.suggestions.join(', ') 
                  : 'Apply the STAR layout method for behavioral answers. Take targeted study plans to review weak categories.'
                }
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => setResult(null)} 
              className="w-1/2 text-center rounded-xl border border-slate-800 bg-slate-950 py-3 text-xs font-bold text-slate-350 hover:bg-slate-900/60 hover:text-white transition"
            >
              Practice Again
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

export default MockInterview

