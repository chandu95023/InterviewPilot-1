import { useEffect, useState } from 'react'
import { getQuestionsHistory } from '../api/api'

const QuestionHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getQuestionsHistory()
      .then((response) => setHistory(response.data.questions))
      .catch(() => setError('Unable to load saved questions.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-16">Loading saved questions...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Saved Question History</h2>
        <p className="mt-3 text-slate-600">Review all generated questions from your practice sessions, including company-specific and domain-based items.</p>
      </div>

      {error && <div className="rounded-3xl bg-red-50 p-4 text-red-700">{error}</div>}

      {history.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {history.map((item) => (
            <div key={item.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">{item.domain} · {item.difficulty}</span>
                {item.company && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.company}</span>}
              </div>
              <p className="mt-4 text-slate-700"><strong>Question:</strong> {item.question}</p>
              <p className="mt-4 text-slate-700"><strong>Ideal answer:</strong> {item.answer}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-slate-700">No saved questions found. Generate new questions from the company prep or mock interview pages to populate this history.</p>
        </div>
      )}
    </div>
  )
}

export default QuestionHistory
