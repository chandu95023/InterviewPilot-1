import { useEffect, useState } from 'react'
import { getCompanyPerformance } from '../api/api'

const CompanyPerformance = () => {
  const [performance, setPerformance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCompanyPerformance()
      .then((response) => setPerformance(response.data.company_performance))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-16">Loading company performance...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Company Performance Analytics</h2>
        <p className="mt-3 text-slate-600">Track your question-level performance for company-specific interview preparation.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {performance.length > 0 ? performance.map((item) => (
          <div key={item.company} className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">{item.company}</h3>
            <p className="mt-3 text-slate-700">Average score: <strong>{item.average_score}</strong></p>
            <p className="mt-2 text-slate-700">Company-specific question attempts: <strong>{item.question_attempts}</strong></p>
          </div>
        )) : (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-slate-700">No company-specific performance data available yet. Generate company questions and complete mock interviews to populate this dashboard.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompanyPerformance
