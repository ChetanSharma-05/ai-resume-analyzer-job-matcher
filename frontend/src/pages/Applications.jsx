import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const labels = { applied: 'Applied', under_review: 'Under Review', shortlisted: 'Shortlisted', interview: 'Interview', rejected: 'Rejected', hired: 'Hired', withdrawn: 'Withdrawn' }

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { api.get('/applications/my/').then(({ data }) => setApplications(data.results || data)).catch(() => setError('Applications could not be loaded.')) }, [])
  async function withdraw(id) { try { await api.delete(`/applications/${id}/`); setApplications((items) => items.map((item) => item.id === id ? { ...item, status: 'withdrawn' } : item)) } catch (err) { setError(err.response?.data?.message || 'This application cannot be withdrawn.') } }
  return <div><Navbar /><main className="max-w-6xl mx-auto px-6 py-10"><div className="flex justify-between items-end"><div><p className="text-sm text-primary-600 font-semibold uppercase tracking-widest">Candidate workspace</p><h1 className="text-3xl font-bold mt-2">My applications</h1></div></div>{error && <p className="mt-5 bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</p>}{!applications.length ? <div className="bg-white border rounded-xl p-12 text-center mt-8"><h2 className="font-semibold">No applications yet</h2><p className="text-sm text-gray-500 mt-2">Explore jobs and find your next opportunity.</p></div> : <div className="grid gap-4 mt-8">{applications.map((application) => <div key={application.id} className="bg-white border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h2 className="font-semibold">{application.job.title}</h2><p className="text-sm text-gray-500">{application.job.company} · {application.job.location || 'Remote'}</p><p className="text-xs text-gray-400 mt-2">Applied {new Date(application.applied_at).toLocaleDateString()}</p></div><div className="flex items-center gap-5"><div className="text-center"><p className="font-bold text-primary-600">{application.match_score ?? '—'}%</p><p className="text-xs text-gray-400">Match</p></div><span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs">{labels[application.status] || application.status}</span>{['applied', 'under_review'].includes(application.status) && <button onClick={() => withdraw(application.id)} className="text-xs text-red-600">Withdraw</button>}</div></div>)}</div>}</main></div>
}
