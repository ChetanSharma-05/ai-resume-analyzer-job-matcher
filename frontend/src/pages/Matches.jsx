import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Matches() {
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState('')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadResumes()
  }, [])

  async function loadResumes() {
    const { data } = await api.get('/resumes/')
    const list = data.results || data
    setResumes(list)
    if (list.length > 0) setSelectedResume(list[0].id)
  }

  useEffect(() => {
    if (selectedResume) loadMatches(selectedResume)
  }, [selectedResume])

  async function loadMatches(resumeId) {
    setLoading(true)
    try {
      const { data } = await api.get(`/matching/${resumeId}/`)
      setMatches(data.data)
    } catch (err) {
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Job Matches</h1>

        {resumes.length === 0 ? (
          <p className="text-gray-400 text-sm">Upload a resume first to see recommended jobs.</p>
        ) : (
          <>
            <select
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm mb-6"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>

            {loading ? (
              <p className="text-gray-400 text-sm">Calculating matches...</p>
            ) : matches.length === 0 ? (
              <p className="text-gray-400 text-sm">No matches yet. Make sure this resume has been analyzed and jobs exist in the system.</p>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <Link to={`/jobs/${m.job.id}`} key={m.id} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition">
                    <div>
                      <p className="font-semibold">{m.job.title}</p>
                      <p className="text-sm text-gray-500">{m.job.company} · {m.job.location || 'Remote'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600">{m.match_score}%</p>
                      <p className="text-xs text-gray-400">match score</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
