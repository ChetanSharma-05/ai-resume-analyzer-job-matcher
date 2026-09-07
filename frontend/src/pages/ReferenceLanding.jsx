import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const metrics = [['10K+', 'Open roles'], ['25K+', 'Career profiles'], ['5K+', 'Hiring companies'], ['100K+', 'Applications tracked']]
const features = [
  ['✦', 'AI resume insights', 'Turn a resume into a clear, actionable readiness report.'],
  ['◎', 'Role matching', 'See where your skills align before you apply.'],
  ['▥', 'Application clarity', 'Keep every application, stage, and interview in one place.'],
  ['◇', 'Recruiter workspace', 'Review talent consistently, with human decisions always in control.'],
]

export default function ReferenceLanding() {
  const [menu, setMenu] = useState(false)
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    api.get('/jobs/').then(({ data }) => setJobs((data.results || data).slice(0, 3))).catch(() => setJobs([]))
  }, [])

  return (
    <main className="reference-landing">
      <nav className="reference-nav">
        <Link className="reference-brand" to="/"><span>✦</span> ResumeAI</Link>
        <button className="reference-menu" onClick={() => setMenu(!menu)} aria-label="Toggle navigation">{menu ? '×' : '☰'}</button>
        <div className={`reference-links ${menu ? 'open' : ''}`}>
          <a href="#features">Platform</a>
          <a href="#how">How it works</a>
          <a href="#companies">For companies</a>
          <Link to="/login">Sign in</Link>
          <Link className="reference-button small" to="/register">Get started <span>→</span></Link>
        </div>
      </nav>

      <section className="reference-hero">
        <div className="reference-eyebrow">✦ Career intelligence, made practical</div>
        <h1>Find the right job.<br /><em>Build the right resume.</em></h1>
        <p>ResumeAI brings resume analysis, thoughtful job matching, and a calm application workspace together, so your next move is more intentional.</p>
        <div className="reference-actions"><Link className="reference-button" to="/jobs">Explore opportunities <span>→</span></Link><Link className="reference-ghost" to="/register">▣ &nbsp; Analyze your resume</Link></div>
        <div className="reference-score-card">
          <div className="reference-card-title"><span>Resume readiness</span><b>Application-generated · not an official ATS score</b></div>
          <div className="reference-score"><strong>84</strong><span>/100</span><div className="reference-ring">Strong</div></div>
          <div className="reference-bars"><label>Skills <i style={{ width: '88%' }} /></label><label>Keywords <i style={{ width: '76%' }} /></label><label>Experience <i style={{ width: '82%' }} /></label></div>
          <div className="reference-skill-row"><span>Python</span><span>Django</span><span>PostgreSQL</span><span className="missing">+ Docker</span></div>
        </div>
      </section>

      <section className="reference-metrics">{metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</section>

      <section id="features" className="reference-section"><div className="reference-section-copy"><div className="reference-eyebrow">A clearer career system</div><h2>Everything that matters,<br />without the noise.</h2><p>From first upload to final interview, ResumeAI turns a scattered job hunt into a focused workflow.</p></div><div className="reference-feature-grid">{features.map(([icon, title, text]) => <article key={title}><span className="reference-feature-icon">{icon}</span><h3>{title}</h3><p>{text}</p><Link to="/register">Learn more →</Link></article>)}</div></section>

      <section id="how" className="reference-how"><div className="reference-section-copy"><div className="reference-eyebrow">How it works</div><h2>Progress, one good decision at a time.</h2></div><ol><li><b>01</b><div><h3>Bring your experience</h3><p>Upload a PDF or DOCX resume securely and build a profile that reflects your real work.</p></div></li><li><b>02</b><div><h3>Understand your fit</h3><p>Review transparent skill, keyword, and experience signals for opportunities that interest you.</p></div></li><li><b>03</b><div><h3>Move with confidence</h3><p>Apply, prepare, and track every stage, from first application to interview.</p></div></li></ol></section>

      <section id="companies" className="reference-company"><span className="reference-company-icon">▣</span><div><div className="reference-eyebrow">For hiring teams</div><h2>Find the signal in every application.</h2><p>Structured reviews, candidate comparisons, and recruitment stages designed to support, not replace, human judgment.</p></div><Link className="reference-button light" to="/register?role=recruiter">Build your workspace <span>→</span></Link></section>

      <section className="reference-live"><div className="reference-section-copy"><div className="reference-eyebrow">Live marketplace</div><h2>Latest opportunities.</h2></div><div className="reference-job-grid">{jobs.length ? jobs.map((job) => <Link className="reference-job" key={job.id} to={`/jobs/${job.id}`}><small>{job.company}</small><h3>{job.title}</h3><p>{job.location || 'Remote'} · {job.employment_type?.replace('_', ' ')}</p><footer>{job.salary || 'Salary not listed'} <span>→</span></footer></Link>) : <p className="reference-empty">New opportunities will appear here.</p>}</div></section>

      <section className="reference-cta"><h2>Your next chapter deserves a better system.</h2><Link className="reference-button" to="/register">Create your account <span>→</span></Link></section>
      <footer className="reference-footer"><Link className="reference-brand" to="/"><span>✦</span> ResumeAI</Link><p>AI-powered career intelligence with people at the center.</p><small>© 2026 ResumeAI. Application scores are guidance, not hiring decisions.</small></footer>
    </main>
  )
}
