import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const statuses = ['under_review', 'shortlisted', 'interview', 'rejected', 'hired']

export default function RecruiterApplications() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/applications/recruiter/')
      .then(({ data }) => setItems(data.results || data))
      .catch(() => setError('Applications could not be loaded.'))
  }, [])

  async function changeStatus(id, status) {
    try {
      const { data } = await api.patch(`/applications/${id}/status/`, { status })
      setItems((current) => current.map((item) => item.id === id ? data.data : item))
    } catch (err) {
      setError(err.response?.data?.message || 'Status could not be updated.')
    }
  }

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
      setError(err.response?.data?.message || 'Resume download failed. Please try again.')
    }
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-gray-500 mt-2">Review candidate information, resume scores, and hiring stages.</p>
        {error && <p className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-5">{error}</p>}
        <div className="grid gap-4 mt-8">
          {items.map((item) => (
            <div key={item.id} className="bg-white border rounded-xl p-5">
              <div className="grid md:grid-cols-[1.2fr_1fr_auto_auto] gap-4 items-center">
                <div>
                  <p className="font-semibold">{item.candidate_name}</p>
                  <p className="text-sm text-gray-500">{item.candidate_email}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.phone || 'Phone not provided'} · {item.location || 'Location not provided'}</p>
                </div>
                <div>
                  <p className="font-medium text-sm">{item.job.title}</p>
                  <p className="text-xs text-gray-400">{item.resume?.title} · Applied {new Date(item.applied_at).toLocaleDateString()}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-primary-600">{item.match_score ?? '—'}%</p>
                  <p className="text-xs text-gray-400">Job match</p>
                  <p className="text-xs text-gray-400 mt-1">ATS {item.ats_score ?? '—'}%</p>
                </div>
                <select value={item.status} onChange={(e) => changeStatus(item.id, e.target.value)} className="border rounded-md px-2 py-2 text-sm">
                  <option value={item.status}>{item.status.replace('_', ' ')}</option>
                  {statuses.filter((status) => status !== item.status).map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="mt-4 pt-4 border-t grid md:grid-cols-[1fr_auto] gap-4">
                <div>
                  <p className="text-sm font-medium">Portfolio / LinkedIn</p>
                  <p className="text-sm text-gray-500 break-all">{item.portfolio_url || 'Not provided'} · Notice: {item.notice_period || 'Not provided'}</p>
                  <p className="text-sm font-medium mt-3">Cover letter</p>
                  <p className="text-sm text-gray-500 whitespace-pre-line">{item.cover_letter || 'No cover letter provided.'}</p>
                </div>
                {item.resume_download_url && <button onClick={() => downloadResume(item)} className="self-start bg-primary-600 text-white px-4 py-2 rounded-md text-sm">Download resume</button>}
              </div>
            </div>
          ))}
          {!items.length && <div className="bg-white border rounded-xl p-12 text-center text-gray-400">No applications received yet.</div>}
        </div>
      </main>
    </div>
  )
}
