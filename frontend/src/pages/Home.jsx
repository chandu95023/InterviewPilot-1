import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="rounded-3xl bg-white shadow-lg p-10">
      <h1 className="text-4xl font-bold text-slate-900">AI Interview Preparation Platform</h1>
      <p className="mt-4 text-slate-600 max-w-2xl">Prepare for your next interview with AI-powered practice questions, mock interviews, resume insights, and personalised analytics.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link to="/register" className="rounded-2xl bg-slate-900 text-white px-6 py-4 text-center hover:bg-slate-700">Get Started</Link>
        <Link to="/mock-interview" className="rounded-2xl border border-slate-200 px-6 py-4 text-center hover:bg-slate-50">Start Mock Interview</Link>
        <Link to="/study-plan" className="rounded-2xl border border-slate-200 px-6 py-4 text-center hover:bg-slate-50">Generate Study Plan</Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/company-prep" className="rounded-2xl border border-slate-200 px-6 py-4 text-center hover:bg-slate-50">Company Interview Prep</Link>
        <Link to="/coding-challenge" className="rounded-2xl border border-slate-200 px-6 py-4 text-center hover:bg-slate-50">Coding Challenge Practice</Link>
      </div>
    </div>
  )
}

export default Home
