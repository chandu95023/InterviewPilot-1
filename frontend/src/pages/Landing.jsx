import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Video, 
  FileText, 
  Terminal, 
  Building2, 
  Sparkles, 
  Award, 
  Activity, 
  Cpu, 
  CheckCircle2,
  Globe
} from 'lucide-react'

const features = [
  { 
    title: 'AI Mock Interviews', 
    description: 'Realistic simulated interviews with adaptive AI voice questions and instant diagnostic scoring.',
    icon: Video,
    color: 'from-indigo-500 to-purple-650'
  },
  { 
    title: 'Resume Intelligence', 
    description: 'Deep ATS scanning, keyword gap analysis, and personalized interview questions based on your resume.',
    icon: FileText,
    color: 'from-cyan-500 to-blue-650'
  },
  { 
    title: 'Technical Assessments', 
    description: 'Evaluate structural answers, algorithm design, coding proficiency, and technical terminology.',
    icon: Terminal,
    color: 'from-violet-500 to-indigo-650'
  },
  { 
    title: 'HR Interview Training', 
    description: 'Master behavioral and situational challenges using the STAR method with AI feedback.',
    icon: Award,
    color: 'from-rose-500 to-red-650'
  },
  { 
    title: 'Company-Specific Prep', 
    description: 'Practice curated questions matching the hiring processes of Google, Amazon, Microsoft, and others.',
    icon: Building2,
    color: 'from-emerald-500 to-teal-650'
  },
  { 
    title: 'Performance Analytics', 
    description: 'Detailed analytics dashboards tracking speaking speed, confidence, eye contact, and domain readiness.',
    icon: Activity,
    color: 'from-amber-500 to-orange-650'
  },
]

const testimonials = [
  {
    name: 'Sarah Jenkins',
    role: 'Software Engineer',
    company: 'Google',
    quote: 'The real-time confidence tracking and ATS resume builder got me through Google\'s challenging interview loop.',
    rating: 5,
    avatar: 'SJ'
  },
  {
    name: 'David Chen',
    role: 'Product Manager',
    company: 'Stripe',
    quote: 'Speech-to-text accuracy combined with specific STAR method coaching completely changed my delivery style.',
    rating: 5,
    avatar: 'DC'
  },
  {
    name: 'Elena Rostova',
    role: 'Frontend Dev',
    company: 'Vercel',
    quote: 'Beautiful interface, responsive support, and mock coding questions that mirror real-world screens.',
    rating: 5,
    avatar: 'ER'
  },
  {
    name: 'Marcus Brody',
    role: 'Data Scientist',
    company: 'Meta',
    quote: 'The weekly analytics reports clearly pinpointed my architectural gaps. Recommended to everyone!',
    rating: 5,
    avatar: 'MB'
  }
]

const Landing = () => (
  <div className="space-y-24 pb-20">
    {/* HERO SECTION */}
    <section className="max-w-6xl mx-auto px-6 pt-10">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
        {/* Left Info Column */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-950/80 px-4 py-1.5 text-xs font-semibold text-indigo-300 border border-indigo-800/40">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            AI-Powered Career Success
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Land Your Dream Job With{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
              Intelligent Interview Coaching
            </span>
          </h1>
          <p className="max-w-xl text-sm sm:text-base leading-relaxed text-slate-400">
            Practice realistic interviews, improve behavioral and technical articulation, receive instant multi-metric feedback, and level up your hiring metrics.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-650 px-6 py-3.5 text-xs font-bold tracking-wide text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition duration-200"
            >
              Start Mock Interview
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950 px-6 py-3.5 text-xs font-bold tracking-wide text-slate-350 hover:bg-slate-900/60 hover:text-white transition"
            >
              Analyze Resume
            </Link>
          </div>
        </motion.div>

        {/* Right Dashboard Mockup Column */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative animate-float"
        >
          {/* Main Card Backdrop Glowing effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-[2rem] filter blur-2xl animate-pulse-glow" />
          
          <div className="relative glass-card rounded-[2.25rem] p-6 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Platform Preview</p>
                <h3 className="text-sm font-semibold text-white">Live Coaching Snapshot</h3>
              </div>
              <span className="rounded-full bg-emerald-950/80 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-850">
                AI Active
              </span>
            </div>

            {/* Metric Grids */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800/40">
                <p className="text-[10px] text-slate-500 font-semibold tracking-wide">Readiness Score</p>
                <p className="mt-1 text-2xl font-bold text-white">88%</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full w-[88%]" />
                </div>
              </div>
              <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800/40">
                <p className="text-[10px] text-slate-500 font-semibold tracking-wide">Confidence Index</p>
                <p className="mt-1 text-2xl font-bold text-cyan-400">92%</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full w-[92%]" />
                </div>
              </div>
            </div>

            {/* Performance progress line */}
            <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800/40 space-y-3">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>ATS Resume Score</span>
                <span className="text-white font-semibold">94/100</span>
              </div>
              <div className="flex gap-1.5 h-1.5">
                {[70, 80, 95, 94].map((h, i) => (
                  <div key={i} className="flex-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full" style={{ width: `${h}%` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed feedback ticker */}
            <div className="rounded-2xl bg-indigo-950/20 p-4 border border-indigo-900/30">
              <div className="flex gap-2">
                <Cpu className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-350">AI Coach Evaluation</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    "Excellent articulation of complex systems. Speaking speed is balanced. Consider adding one project impact metric."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* FEATURES SECTION */}
    <section id="features" className="max-w-6xl mx-auto px-6 space-y-12">
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Everything You Need to Ace the Interview
        </h2>
        <p className="text-xs sm:text-sm text-slate-450 leading-relaxed">
          Powered by state-of-the-art LLMs, real-time audio parsing, and ATS scanning configurations.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feat) => {
          const Icon = feat.icon
          return (
            <motion.div 
              key={feat.title} 
              whileHover={{ y: -6 }}
              className="group relative rounded-[2rem] border border-slate-900 bg-slate-950 p-6 shadow-xl transition-all duration-300 hover:border-slate-800"
            >
              {/* Top gradient border mask hover */}
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className={`inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr ${feat.color} text-white shadow-lg mb-6`}>
                <Icon className="h-5 w-5" />
              </div>
              
              <h3 className="text-base font-semibold text-white">{feat.title}</h3>
              <p className="mt-3 text-xs text-slate-450 leading-relaxed">{feat.description}</p>
              
              <div className="mt-6 flex">
                <Link to="/register" className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 group-hover:text-indigo-350 transition">
                  Learn more
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>

    {/* TESTIMONIALS SECTION */}
    <section id="testimonials" className="max-w-6xl mx-auto px-6 space-y-12">
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Trusted by Top Engineers Worldwide
        </h2>
        <p className="text-xs sm:text-sm text-slate-450">
          Our candidates land jobs at leading technology organizations.
        </p>
      </div>

      {/* Horizontal scrolling testimonial row */}
      <div className="overflow-x-auto pb-4 scrollbar-none">
        <div className="flex gap-6 w-max px-2">
          {testimonials.map((t, index) => (
            <div 
              key={index} 
              className="w-80 glass-card rounded-[1.75rem] p-6 border border-slate-900 hover:border-slate-850 transition duration-300 space-y-5"
            >
              <div className="flex gap-1 text-amber-400">
                {[...Array(t.rating)].map((_, i) => (
                  <span key={i} className="text-base">★</span>
                ))}
              </div>
              <p className="text-xs text-slate-350 leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 border-t border-slate-900 pt-4">
                <div className="h-8 w-8 rounded-full bg-slate-850 border border-slate-850 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.name}</h4>
                  <p className="text-[10px] text-slate-500">{t.role} at {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer className="max-w-6xl mx-auto px-6 border-t border-slate-900 pt-12 space-y-10">
      <div className="grid gap-8 grid-cols-2 md:grid-cols-5">
        <div className="col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3 text-sm font-bold text-white tracking-wide">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-650 flex items-center justify-center font-bold text-white text-xs">
              AI
            </div>
            <span>InterviewPrep AI</span>
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            Empowering professionals to navigate interviews with real-time biometric metrics, domain questions, and structured response systems.
          </p>
          <div className="flex gap-4 text-slate-550 pt-2">
            <a href="#" className="hover:text-white transition"><Globe className="h-4.5 w-4.5 text-slate-500" /></a>
            <a href="#" className="hover:text-white transition"><Sparkles className="h-4.5 w-4.5 text-slate-500" /></a>
            <a href="#" className="hover:text-white transition"><Award className="h-4.5 w-4.5 text-slate-500" /></a>
          </div>
        </div>

        {/* Links lists */}
        {[
          {
            title: 'Product',
            links: ['AI Mocks', 'Resume scan', 'Pricing', 'API docs']
          },
          {
            title: 'Resources',
            links: ['Guides', 'STAR practice', 'Company logs', 'FAQs']
          },
          {
            title: 'Company',
            links: ['About us', 'Careers', 'Privacy policy', 'Terms']
          }
        ].map((sec) => (
          <div key={sec.title} className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{sec.title}</h4>
            <ul className="space-y-2 text-[11px] text-slate-450">
              {sec.links.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-950 pt-6 text-center">
        <p className="text-[10px] text-slate-655">
          &copy; {new Date().getFullYear()} InterviewPrep AI. All rights reserved. Built with love for future leaders.
        </p>
      </div>
    </footer>
  </div>
)

export default Landing

