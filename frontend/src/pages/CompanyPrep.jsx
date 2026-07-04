import { useEffect, useState } from 'react'
import { getCompanies, generateCompanyQuestions } from '../api/api'
import { 
  Building2, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Brain,
  AlertCircle,
  HelpCircle,
  Award
} from 'lucide-react'

const CompanyPrep = () => {
  console.log('CompanyPrep Loaded')
  const [companies, setCompanies] = useState([])
  const [company, setCompany] = useState('Google')
  const [domain, setDomain] = useState('Full Stack Development')
  const [difficulty, setDifficulty] = useState('Medium')
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Track open states for accordions
  const [expandedQuestion, setExpandedQuestion] = useState(null)

  useEffect(() => {
    getCompanies()
      .then((res) => {
        const list = res.data.companies || [];
        // Ensure list of objects with name property
        const normalized = list.map((c) => typeof c === 'string' ? { name: c, emoji: '' } : c);
        setCompanies(normalized);
        if (normalized.length) setCompany(normalized[0].name);
      })
      .catch(() => {
        const fallback = ['Google', 'Amazon', 'Microsoft', 'Stripe', 'Netflix'];
        const normalized = fallback.map((c) => ({ name: c, emoji: '' }));
        setCompanies(normalized);
      });
  }, [])

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setQuestions([])
    try {
      const response = await generateCompanyQuestions({ company, domain, difficulty, count: 4 })
      setQuestions(response.data.questions || [])
    } catch (err) {
      setError('Unable to compile company-specific questions. Please check server connections.')
    } finally {
      setLoading(false)
    }
  }

  const toggleAccordion = (idx) => {
    setExpandedQuestion(expandedQuestion === idx ? null : idx)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">Company Preparation</h2>
        <p className="text-xs text-slate-400 mt-1">Review specific interview logs and practice domain questions curated from company loops.</p>
      </div>

      {/* Selectors card */}
      <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md space-y-5">
        <div className="flex items-center gap-2 text-indigo-400">
          <Building2 className="h-4 w-4" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-350">Practice Targets</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Company</label>
            <select 
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white outline-none focus:border-indigo-500" 
              value={company} 
              onChange={(e) => setCompany(e.target.value)}
            >
              {companies.length === 0 ? (
                <option disabled>Loading companies...</option>
              ) : (
                companies.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.emoji ? `${c.emoji} ${c.name}` : c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Domain Category</label>
            <select 
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white outline-none focus:border-indigo-500" 
              value={domain} 
              onChange={(e) => setDomain(e.target.value)}
            >
              {['Java', 'Python', 'Full Stack Development', 'Data Science', 'AI/ML'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Difficulty</label>
            <select 
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white outline-none focus:border-indigo-500" 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {['Easy', 'Medium', 'Hard'].map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-950/20 border border-red-900/30 p-3.5 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-650 py-3.5 text-xs font-bold tracking-wide text-white hover:from-indigo-600 hover:to-violet-750 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Compiling loop configurations...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4.5 w-4.5" />
              <span>Generate Company Interview Set</span>
            </>
          )}
        </button>
      </div>

      {/* Accordion Questions container */}
      {questions.length > 0 && (
        <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <Brain className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Target Questions list</h3>
          </div>

          <div className="space-y-3">
            {questions.map((q, index) => {
              const isExpanded = expandedQuestion === index
              return (
                <div 
                  key={q.id || index} 
                  className="rounded-2xl border border-slate-900 bg-slate-950/40 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-900/40 transition"
                  >
                    <div className="flex items-start gap-2.5">
                      <HelpCircle className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-white leading-relaxed">
                        Q{index + 1}: {q.question}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1.5 border-t border-slate-900 text-xs text-slate-400 space-y-3 bg-slate-950/80 leading-relaxed animate-in fade-in duration-200">
                      <div className="flex gap-2">
                        <Award className="h-4.5 w-4.5 text-violet-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-300 font-bold block mb-1">AI Evaluated Ideal Answer:</strong>
                          <p>{q.answer}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyPrep

