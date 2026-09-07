import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const features = [
  ['AI Resume Analysis', 'Extract skills, education, experience and projects from your resume.'],
  ['ATS-style scoring', 'See the strengths and gaps that affect your application readiness.'],
  ['Smart job matching', 'Compare skills and semantic relevance against real job listings.'],
  ['Recruiter workflows', 'Post roles, review applicants and move candidates through your pipeline.'],
]

const rolePaths = [
  { label: 'Candidate', title: 'Turn your resume into momentum.', text: 'Analyze your resume, discover skill-aligned jobs, apply with confidence, and track every application.', link: '/register', cta: 'Candidate signup', tone: 'sky' },
  { label: 'Recruiter', title: 'Find people who fit the work.', text: 'Post roles, see resume match scores, review applicants, shortlist, interview, and hire from one workspace.', link: '/register?role=recruiter', cta: 'Recruiter signup', tone: 'violet' },
  { label: 'Admin', title: 'Keep the marketplace healthy.', text: 'Manage users, jobs, applications, skills, and platform activity from the secure admin area.', link: '/login', cta: 'Admin login', tone: 'amber' },
]

export default function Landing() {
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    api.get('/jobs/').then(({ data }) => setJobs((data.results || data).slice(0, 3))).catch(() => setJobs([]))
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main>
        <section className="relative overflow-hidden px-6 pt-20 pb-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,.22),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,.18),_transparent_38%)]" />
          <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_.9fr] gap-14 items-center">
            <div>
              <p className="text-sky-300 text-sm font-semibold tracking-[.2em] uppercase mb-5">Intelligent career decisions</p>
              <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">Build a better resume. Find the right job.</h1>
              <p className="mt-6 text-lg text-slate-300 max-w-xl">AI-powered resume analysis and intelligent job matching that helps candidates discover better opportunities and helps recruiters find the right talent faster.</p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/register" className="bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold px-5 py-3 rounded-lg transition">Analyze My Resume</Link>
                <Link to="/jobs" className="border border-slate-600 hover:border-sky-300 px-5 py-3 rounded-lg transition">Explore Jobs</Link>
              </div>
              <Link to="/register?role=recruiter" className="inline-block mt-8 text-sm text-slate-400 hover:text-white">Are you hiring? Build your recruiting pipeline →</Link>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6"><span className="text-sm text-slate-300">Resume intelligence</span><span className="text-xs text-emerald-300 bg-emerald-300/10 px-2 py-1 rounded-full">Ready to improve</span></div>
              <div className="grid grid-cols-2 gap-3">
                <Metric label="ATS score" value="84%" accent="text-sky-300" />
                <Metric label="Best match" value="92%" accent="text-emerald-300" />
                <Metric label="Skills found" value="18" accent="text-violet-300" />
                <Metric label="Skill gaps" value="4" accent="text-amber-300" />
              </div>
              <div className="mt-4 bg-slate-900/70 rounded-xl p-4"><div className="flex justify-between text-sm mb-2"><span>Backend Engineer</span><span className="text-emerald-300">92% match</span></div><div className="h-2 bg-slate-700 rounded-full"><div className="h-2 w-[92%] bg-emerald-400 rounded-full" /></div></div>
            </div>
          </div>
        </section>

        <section className="bg-white text-slate-900 px-6 py-20"><div className="max-w-6xl mx-auto"><p className="text-sky-600 font-semibold text-sm uppercase tracking-widest">One platform, two perspectives</p><h2 className="text-3xl font-bold mt-3">Make every career move more informed.</h2><div className="grid md:grid-cols-4 gap-4 mt-10">{features.map(([title, text]) => <div key={title} className="border border-slate-200 rounded-xl p-5"><div className="text-sky-600 text-xl mb-4">✦</div><h3 className="font-semibold">{title}</h3><p className="text-sm text-slate-500 mt-2 leading-6">{text}</p></div>)}</div></div></section>

        <section id="how-it-works" className="bg-slate-100 text-slate-900 px-6 py-20"><div className="max-w-6xl mx-auto"><p className="text-sky-600 font-semibold text-sm uppercase tracking-widest">ResumeAI pathways</p><h2 className="text-3xl font-bold mt-3">One system. Three clear roles.</h2><div className="grid lg:grid-cols-3 gap-5 mt-10">{rolePaths.map((path) => <div key={path.label} className="bg-white border border-slate-200 rounded-2xl p-6"><div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${path.tone === 'sky' ? 'bg-sky-100 text-sky-700' : path.tone === 'violet' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>{path.label[0]}</div><p className="text-xs uppercase tracking-widest text-slate-400 mt-6">{path.label}</p><h3 className="text-xl font-bold mt-2">{path.title}</h3><p className="text-sm text-slate-500 leading-6 mt-3">{path.text}</p><Link to={path.link} className="inline-block mt-6 text-sm font-semibold text-sky-700">{path.cta} →</Link></div>)}</div><div className="mt-12 grid md:grid-cols-5 gap-2 items-center text-center">{['Create account', 'Analyze resume', 'Match skills', 'Apply', 'Shortlist → Hire'].map((step, index) => <React.Fragment key={step}><div className="bg-white border border-slate-200 rounded-lg px-3 py-4 text-sm font-medium">{step}</div>{index < 4 && <span className="hidden md:block text-slate-400">→</span>}</React.Fragment>)}</div></div></section>

        <section className="bg-slate-50 text-slate-900 px-6 py-20"><div className="max-w-6xl mx-auto"><div className="flex items-end justify-between gap-4"><div><p className="text-sky-600 font-semibold text-sm uppercase tracking-widest">Live marketplace</p><h2 className="text-3xl font-bold mt-3">Latest opportunities</h2></div><Link to="/jobs" className="text-sm font-semibold text-sky-700">View all jobs →</Link></div><div className="grid md:grid-cols-3 gap-4 mt-8">{jobs.length ? jobs.map((job) => <Link key={job.id} to={`/jobs/${job.id}`} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-sky-300 transition"><p className="text-xs text-slate-400">{job.company}</p><h3 className="font-semibold mt-2">{job.title}</h3><p className="text-sm text-slate-500 mt-2">{job.location || 'Remote'} · {job.employment_type?.replace('_', ' ')}</p><p className="text-sm text-slate-500 mt-4">{job.salary || 'Salary not listed'}</p></Link>) : <div className="md:col-span-3 border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">New opportunities will appear here.</div>}</div></div></section>

        <section className="bg-sky-600 px-6 py-16"><div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6 items-start md:items-center"><div><h2 className="text-3xl font-bold">Your next opportunity starts with clarity.</h2><p className="text-sky-100 mt-2">Build a profile that works as hard as you do.</p></div><Link to="/register" className="bg-white text-sky-700 font-semibold px-5 py-3 rounded-lg">Get Started</Link></div></section>
      </main>
    </div>
  )
}

function Metric({ label, value, accent }) {
  return <div className="bg-slate-900/70 rounded-xl p-4"><p className="text-xs text-slate-400">{label}</p><p className={`text-3xl font-bold mt-2 ${accent}`}>{value}</p></div>
}
