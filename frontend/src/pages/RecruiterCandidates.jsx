import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function RecruiterCandidates() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [minMatch, setMinMatch] = useState('')
  const [error, setError] = useState('')

  async function load() {
    try {
      const { data } = await api.get('/applications/recruiter/candidates/', { params: { search, status, min_match: minMatch } })
      setItems(data.results || data)
    } catch (err) {
      setError(err.response?.data?.message || 'Candidates could not be loaded.')
    }
  }

  useEffect(() => { load() }, [])

  async function downloadResume(application) {
    try {
      const response = await api.get(`/applications/${application.id}/resume/`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = application.resume?.title || 'candidate-resume'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.response?.data?.message || 'Resume download failed.')
    }
  }

  return (
    <div><Navbar /><main className="max-w-6xl mx-auto px-6 py-10">
      <p className="text-sm text-primary-600 font-semibold uppercase tracking-widest">Talent search</p>
      <h1 className="text-3xl font-bold mt-2">Candidate search</h1>
      {error && <p className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-5">{error}</p>}
      <div className="bg-white border rounded-xl p-4 mt-6 flex flex-col md:flex-row gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email, or job title" className="flex-1 border rounded-md px-3 py-2 text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-md px-3 py-2 text-sm"><option value="">All statuses</option><option value="shortlisted">Shortlisted</option><option value="interview">Interview</option><option value="hired">Hired</option><option value="rejected">Rejected</option></select>
        <input value={minMatch} onChange={(e) => setMinMatch(e.target.value)} type="number" min="0" max="100" placeholder="Min match %" className="md:w-32 border rounded-md px-3 py-2 text-sm" />
        <button onClick={load} className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm">Search</button>
      </div>
      <div className="grid gap-4 mt-6">
        {items.map((item) => <div key={item.id} className="bg-white border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h2 className="font-semibold">{item.candidate_name}</h2><p className="text-sm text-gray-500">{item.candidate_email} · {item.job.title}</p><p className="text-xs text-gray-400 mt-2">ATS {item.ats_score ?? '—'}% · {item.status}</p></div><div className="flex items-center gap-5"><strong className="text-primary-600">{item.match_score ?? '—'}% match</strong>{item.resume_download_url && <button onClick={() => downloadResume(item)} className="text-sm text-primary-600">Resume ↓</button>}</div></div>)}
        {!items.length && <div className="bg-white border rounded-xl p-12 text-center text-gray-400">No candidates match these filters.</div>}
      </div>
    </main></div>
  )
}
