import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Terminal,
  Brain,
  HelpCircle,
  Clock
} from 'lucide-react'
import { askAssistant, getAssistantHistory } from '../api/api'

const QUICK_PROMPTS = [
  { text: "Mock a technical question for Java Multithreading.", label: "Java QA" },
  { text: "How should I structure my resume experience section?", label: "Resume Help" },
  { text: "What is the STAR method for behavioral questions?", label: "STAR Guide" },
  { text: "Explain Consistent Hashing simply.", label: "System Design" }
]

const AIAssistant = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState('')

  const chatEndRef = useRef(null)

  const fetchHistory = () => {
    setHistoryLoading(true)
    getAssistantHistory()
      .then((res) => {
        setMessages(res.data.history || [])
      })
      .catch(() => setError('Unable to load chat history.'))
      .finally(() => setHistoryLoading(false))
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim()
    if (!text) return

    setInput('')
    setError('')
    setLoading(true)

    // Add user message to state first
    const userMsg = { question: text, answer: '', isLocalUser: true }
    setMessages((prev) => [...prev, userMsg])

    try {
      const response = await askAssistant({ question: text })
      // Update with assistant response
      setMessages((prev) => {
        const updated = [...prev]
        const lastIdx = updated.length - 1
        if (lastIdx >= 0) {
          updated[lastIdx] = {
            id: response.data.id,
            question: response.data.question,
            answer: response.data.answer,
            created_at: response.data.created_at
          }
        }
        return updated
      })
    } catch (err) {
      setError('Failed to reach AI Coach. Please verify API response.')
      // Remove the unsent message from view
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handlePromptClick = (promptText) => {
    if (loading) return
    handleSend(promptText)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px]">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Live AI Coach Assistant</h2>
          <p className="text-xs text-slate-400 mt-1">Ask questions about resume, coding paradigms, behavioral interviews, or platform features.</p>
        </div>
        <button 
          onClick={fetchHistory}
          className="text-slate-500 hover:text-indigo-400 p-2 border border-slate-900 hover:border-slate-800 rounded-xl transition duration-200"
          title="Refresh History"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="my-3 rounded-xl bg-red-950/20 border border-red-900/30 p-3.5 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Main chat window */}
      <div className="flex-1 overflow-y-auto min-h-0 py-6 pr-1 space-y-5 scrollbar-thin">
        {historyLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="h-7 w-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-500">Retrieving chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="max-w-md mx-auto text-center space-y-6 py-12">
            <div className="h-16 w-16 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400">
              <Bot className="h-8 w-8 animate-float" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">Ask your Coach Anything</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Whether you need advice on a behavioral answer, system design definitions, or code optimizations, your personal AI Coach is ready.
              </p>
            </div>

            {/* suggestions */}
            <div className="grid gap-2.5 pt-2">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(p.text)}
                  className="flex items-center justify-between rounded-2xl border border-slate-900 bg-slate-950/30 px-4 py-3 text-xs text-slate-350 hover:bg-slate-900/40 hover:text-white transition duration-200 text-left group"
                >
                  <span>{p.text}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:translate-x-1 group-hover:text-indigo-400 transition" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((m, idx) => (
              <div key={idx} className="space-y-3">
                {/* User Message */}
                <div className="flex justify-end items-start gap-3 pl-12">
                  <div className="rounded-2xl rounded-tr-none bg-gradient-to-r from-indigo-650 to-violet-650 px-4.5 py-3 text-xs text-white leading-relaxed max-w-[85%] shadow-md">
                    {m.question}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                </div>

                {/* Assistant Response */}
                {((m.answer && m.answer.trim()) || (loading && idx === messages.length - 1)) && (
                  <div className="flex justify-start items-start gap-3 pr-12">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-md">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-slate-900/80 border border-slate-805 px-5 py-4 text-xs text-slate-300 leading-relaxed max-w-[85%] space-y-2">
                      {loading && idx === messages.length - 1 && !m.answer ? (
                        <div className="flex items-center gap-2 text-slate-500 py-1 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce delay-75" />
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce delay-150" />
                          <span>AI Coach is composing...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{m.answer}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input section */}
      <div className="shrink-0 pt-4 border-t border-slate-900/60 max-w-4xl w-full mx-auto space-y-4">
        {/* prompt quick bar for fast selections */}
        {messages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap mask-grad-right">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handlePromptClick(p.text)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-850 bg-slate-950/40 px-3 py-1.5 text-[10px] text-slate-400 hover:bg-slate-900/30 hover:text-white hover:border-slate-700 transition"
              >
                <Sparkles className="h-3 w-3 text-indigo-400" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        )}

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 pl-5 pr-14 py-4 text-xs text-white placeholder-slate-650 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
            placeholder="Ask your Coach a career or interview question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-3 top-3 h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:scale-105 disabled:opacity-40 disabled:scale-100 transition shadow-lg shadow-indigo-500/10 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default AIAssistant
