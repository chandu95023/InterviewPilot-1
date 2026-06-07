import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  Award, 
  FileText, 
  Brain,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { uploadResume } from '../api/api'

const ResumeUpload = () => {
  const [file, setFile] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setFile(files[0])
      setError('')
    } else {
      setError('Please upload a valid PDF resume.')
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!file) {
      setError('Please upload a PDF resume first.')
      return
    }

    setLoading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await uploadResume(formData)
      setSummary(response.data.resume)
    } catch (err) {
      setError('Unable to analyze resume. Please try again with a valid PDF.')
    } finally {
      setLoading(false)
    }
  }

  // Simulated ATS metrics for premium feel
  const mockAtsScore = 85
  const mockMissingKeywords = ['Kubernetes', 'CI/CD Pipelines', 'GraphQL', 'System Scalability']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">Resume Intelligence</h2>
        <p className="text-xs text-slate-400 mt-1">Upload your PDF resume to extract skills, projects, and receive customized AI interview recommendations.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] items-stretch">
        
        {/* LEFT PANEL: UPLOAD AND SCAN */}
        <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Scanner Configuration</span>
            
            {/* Drag & drop region */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[220px] relative ${
                isDragOver 
                  ? 'border-indigo-500 bg-indigo-950/20' 
                  : 'border-slate-850 bg-slate-950/30 hover:border-slate-800'
              }`}
            >
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className={`h-10 w-10 mb-4 transition-transform ${isDragOver ? 'scale-110 text-indigo-400' : 'text-slate-500'}`} />
              <p className="text-xs font-semibold text-white">Drag & drop your PDF resume</p>
              <p className="text-[10px] text-slate-500 mt-1">or click to browse from files</p>
              {file && (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 border border-slate-800 text-[10px] text-indigo-300 font-semibold max-w-full">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="truncate">{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-950/20 border border-red-900/30 p-3 text-[11px] text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            onClick={handleSubmit} 
            disabled={loading || !file}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-650 py-3.5 text-xs font-bold tracking-wide text-white hover:from-indigo-600 hover:to-violet-750 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Running Scan Benchmarks...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5" />
                <span>Analyze Resume compatibility</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT PANEL: ATS ANALYSIS REPORT */}
        <div className="glass-card rounded-[2rem] p-6 border border-slate-800 shadow-md">
          {summary ? (
            <div className="space-y-6">
              {/* ATS and Compatibility Meter */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">ATS Scanned Metrics</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Benchmarked against industry formats</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Estimated Score</span>
                    <strong className="text-sm text-indigo-400">{mockAtsScore}%</strong>
                  </div>
                  <div className="h-8.5 w-8.5 rounded-full border border-indigo-900/40 bg-indigo-950/40 flex items-center justify-center text-xs font-bold text-indigo-400">
                    ATS
                  </div>
                </div>
              </div>

              {/* Skills and missing keywords layout */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-4 space-y-3">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Identified Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.skills?.map((skill, idx) => (
                      <span key={idx} className="rounded-lg bg-slate-900 px-2.5 py-1 text-[10px] text-slate-350 border border-slate-850">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-4 space-y-3">
                  <div className="flex justify-between items-center text-[10px] uppercase font-semibold">
                    <span className="text-amber-500">Missing Key Technologies</span>
                    <span className="text-slate-500">Industry match</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {mockMissingKeywords.map((word, idx) => (
                      <span key={idx} className="rounded-lg bg-red-950/20 px-2.5 py-1 text-[10px] text-red-400 border border-red-900/20">
                        + {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Education & Certifications lists */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Education Context</span>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {summary.education?.map((item, idx) => (
                      <li key={idx} className="flex gap-2 items-start bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Certifications</span>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {summary.certifications?.length ? (
                      summary.certifications.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                          <Award className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[10px] text-slate-550 italic p-2.5 bg-slate-950/40 rounded-lg border border-slate-900">
                        No active technical certifications extracted.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Recommended Questions accordion */}
              <div className="rounded-2xl border border-indigo-900/30 bg-indigo-950/10 p-5 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Brain className="h-4.5 w-4.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Recommended questions based on profile</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-400">
                  {summary.recommended_questions?.map((question, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      <span className="text-indigo-400 font-bold shrink-0">Q{idx + 1}.</span>
                      <span className="leading-relaxed">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 space-y-3 text-center">
              <TrendingUp className="h-8 w-8 text-slate-655 animate-pulse" />
              <h4 className="text-sm font-semibold text-white">Extract ATS Analytics</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Scan your profile keywords, education levels, and retrieve customized questions by uploading a PDF resume structure.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default ResumeUpload

