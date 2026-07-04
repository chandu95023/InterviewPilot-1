import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Sparkles, Loader2, MessageCircle, ChevronDown } from 'lucide-react'
import { askAssistant } from '../api/api'

/**
 * AIContextChat — Floating AI Coach panel
 * Props:
 *   context: { page, domain, difficulty, currentQuestion, language, targetRole, company, category }
 *   position: 'bottom-right' (default) | 'bottom-left'
 */
const AIContextChat = ({ context = {}, position = 'bottom-right' }) => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Build a system-context prefix from the context prop
  const buildContextPrompt = (userQuestion) => {
    const parts = []
    if (context.page)            parts.push(`Page: ${context.page}`)
    if (context.domain)          parts.push(`Domain/Topic: ${context.domain}`)
    if (context.difficulty)      parts.push(`Difficulty: ${context.difficulty}`)
    if (context.language)        parts.push(`Language: ${context.language}`)
    if (context.targetRole)      parts.push(`Target Role: ${context.targetRole}`)
    if (context.company)         parts.push(`Target Company: ${context.company}`)
    if (context.category)        parts.push(`Category: ${context.category}`)
    if (context.currentQuestion) parts.push(`Current Question: "${context.currentQuestion}"`)

    const contextStr = parts.length
      ? `[Interview Platform Context]\n${parts.join('\n')}\n\n`
      : ''

    return `${contextStr}User's question: ${userQuestion}`
  }

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (quickText) => {
    const text = (quickText || input).trim()
    if (!text || loading) return

    const userMsg = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const enrichedPrompt = buildContextPrompt(text)
      const res = await askAssistant({ question: enrichedPrompt })
      const answer = res.data?.answer || 'Sorry, I could not get a response. Please try again.'
      setMessages(prev => [...prev, { role: 'ai', text: answer }])
      if (!open) setUnread(n => n + 1)
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please check the backend is running.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Quick suggestion chips based on page context
  const getSuggestions = () => {
    const page = context.page?.toLowerCase() || ''
    if (page.includes('coding')) return ['Give me a hint', 'Explain the approach', 'What is the time complexity?', 'Show me an example']
    if (page.includes('mock') || page.includes('voice')) return ['Give me a sample answer', 'What key points should I cover?', 'How do I structure my response?', 'Rate my approach']
    if (page.includes('hr')) return ['Help me use STAR format', 'How do I answer this professionally?', 'Improve my answer', 'Common mistakes to avoid']
    if (page.includes('study')) return ['Explain this topic simply', 'Best resources to learn this', 'How long to master this?', 'Key concepts to focus on']
    if (page.includes('career')) return ['Skills I need to develop', 'How to reach this role faster', 'What companies hire for this?', 'Salary expectations']
    if (page.includes('aptitude')) return ['Explain the formula', 'Give me a shortcut', 'Solve a similar example', 'Common traps in this type']
    return ['Explain this concept', 'Give me an example', 'How do I improve?', 'What should I study next?']
  }

  const posClass = position === 'bottom-left' ? 'left-6' : 'right-6'

  return (
    <>
      {/* Floating Button */}
      <div className={`fixed bottom-6 ${posClass} z-50`}>
        <AnimatePresence>
          {!open && (
            <motion.button
              key="fab"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpen(true)}
              className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 shadow-2xl shadow-indigo-500/40 flex items-center justify-center border border-indigo-400/30"
              title="Ask AI Coach"
            >
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
              <Bot className="h-6 w-6 text-white relative z-10" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#020617]">
                  {unread}
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className={`fixed bottom-6 ${posClass} z-50 w-[360px] max-w-[calc(100vw-3rem)] flex flex-col rounded-2xl border border-slate-700/80 bg-[#0a0f1e]/95 backdrop-blur-xl shadow-2xl shadow-black/50`}
            style={{ maxHeight: 'min(560px, calc(100vh - 6rem))' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60 bg-gradient-to-r from-indigo-900/30 to-violet-900/20 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">AI Coach</p>
                  <p className="text-[9px] text-indigo-400 font-medium">
                    {context.page ? `Context: ${context.page}` : 'Powered by Gemini'}
                    {context.domain ? ` · ${context.domain}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMessages([])}
                  className="text-[9px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded-lg hover:bg-slate-700/40 transition"
                  title="Clear chat"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="text-center py-4 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto">
                    <MessageCircle className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white mb-1">AI Coach is ready!</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Ask anything about {context.domain || context.page || 'this topic'}. I am context-aware and here to help you ace your interviews.
                    </p>
                  </div>
                  {/* Quick suggestion chips */}
                  <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                    {getSuggestions().map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        disabled={loading}
                        className="text-[9px] px-2.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-white transition disabled:opacity-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center mr-2 shrink-0 mt-0.5 shadow-sm">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-sm shadow-md'
                        : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl rounded-bl-sm px-3 py-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div className="border-t border-slate-700/60 px-3 py-3 flex-shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={`Ask about ${context.domain || context.page || 'this topic'}...`}
                  rows={1}
                  disabled={loading}
                  className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-[11px] text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition disabled:opacity-50 leading-relaxed min-h-[36px] max-h-[100px]"
                  style={{ overflow: 'auto' }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="h-9 w-9 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center shadow-md hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5 text-white" />
                  )}
                </button>
              </div>
              <p className="text-[9px] text-slate-600 mt-1.5 text-center">Enter to send · Shift+Enter for newline</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIContextChat
