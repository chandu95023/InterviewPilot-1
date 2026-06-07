import { useState } from 'react'
import { generateStudyPlan } from '../api/api'

const StudyPlan = () => {
  const [domain, setDomain] = useState('Full Stack Development')
  const [currentLevel, setCurrentLevel] = useState('Beginner')
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [weakTopics, setWeakTopics] = useState('')
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    try {
      const response = await generateStudyPlan({ domain, current_level: currentLevel, target_role: targetRole, weak_topics: weakTopics.split(',').map((topic) => topic.trim()).filter(Boolean) })
      setPlan(response.data.study_plan)
      setError('')
    } catch (err) {
      setError('Unable to generate a study plan. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">AI-Generated Study Plan</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <select className="rounded-2xl border border-slate-200 p-3" value={domain} onChange={(e) => setDomain(e.target.value)}>
            {['Java', 'Python', 'Full Stack Development', 'Data Science', 'AI/ML'].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select className="rounded-2xl border border-slate-200 p-3" value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)}>
            {['Beginner', 'Intermediate', 'Advanced'].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <input className="rounded-2xl border border-slate-200 p-3" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Target role" />
          <input className="rounded-2xl border border-slate-200 p-3" value={weakTopics} onChange={(e) => setWeakTopics(e.target.value)} placeholder="Weak topics (comma separated)" />
        </div>
        <button className="mt-6 rounded-3xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-700" onClick={handleGenerate}>Generate Study Plan</button>
        {error && <p className="mt-3 text-red-600">{error}</p>}
      </div>
      {plan && (
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h3 className="text-xl font-semibold">Study Plan</h3>
          <p className="mt-3 text-slate-700 font-medium">{plan.headline}</p>
          <div className="mt-4 space-y-3">
            <div>
              <h4 className="font-semibold">Weekly Plan</h4>
              <ul className="list-disc ml-5 mt-2 text-slate-700">{plan.weekly_plan.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
            </div>
            <div>
              <h4 className="font-semibold">Learning Resources</h4>
              <ul className="list-disc ml-5 mt-2 text-slate-700">{plan.learning_resources.map((resource, idx) => <li key={idx}>{resource}</li>)}</ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudyPlan
