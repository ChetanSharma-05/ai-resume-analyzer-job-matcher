import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function JobDetail() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState('')
  const [matchResult, setMatchResult] = useState(null)
  const [matching, setMatching] = useState(false)
  const [error, setError] = useState('')
  const [savedJobId, setSavedJobId] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    load()
  }, [id, user])

  async function load() {
    const jobRes = await api.get(`/jobs/${id}/`)
    setJob(jobRes.data)
    if (user) {
      const { data } = await api.get('/resumes/')
      const resumeList = data.results || data
      setResumes(resumeList)
      if (resumeList.length > 0) setSelectedResume(resumeList[0].id)
      const saved = await api.get('/engagement/saved-jobs/')
      const savedItem = (saved.data.results || saved.data).find((item) => item.job.id === Number(id))
      if (savedItem) setSavedJobId(savedItem.id)
    }
  }

  async function toggleSavedJob() {
    if (!user) return
    if (savedJobId) {
      await api.delete(`/engagement/saved-jobs/${savedJobId}/`)
      setSavedJobId(null)
    } else {
      const { data } = await api.post('/engagement/saved-jobs/', { job_id: id })
      setSavedJobId(data.id)
    }
  }

  async function runMatch() {
    if (!selectedResume) return
    setError('')
    setMatching(true)
    try {
      const { data } = await api.get(`/matching/${selectedResume}/${id}/`)
      setMatchResult(data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not run match. Make sure the resume has been analyzed.')
    } finally {
      setMatching(false)
    }
  }

  if (!job) return <div><Navbar /><p className="text-center mt-10 text-gray-400">Loading...</p></div>

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <p className="text-gray-500 mb-6">{job.company} · {job.location || 'Remote'} · {job.employment_type}</p>
        <div className="flex flex-wrap gap-3 mb-6">{user && user.role !== 'recruiter' ? <Link to={`/jobs/${id}/apply`} className="inline-block bg-primary-600 text-white px-4 py-2 rounded-md text-sm">Apply Now</Link> : !user ? <Link to="/login" className="inline-block bg-primary-600 text-white px-4 py-2 rounded-md text-sm">Login to Apply</Link> : null}{user && user.role !== 'recruiter' && <button onClick={toggleSavedJob} className="border border-gray-300 px-4 py-2 rounded-md text-sm">{savedJobId ? 'Saved' : 'Save job'}</button>}</div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold mb-2">Job Description</h2>
          <p className="text-sm text-gray-600 whitespace-pre-line">{job.description}</p>
          {job.responsibilities && <><h3 className="font-semibold mt-6 mb-2">Responsibilities</h3><p className="text-sm text-gray-600 whitespace-pre-line">{job.responsibilities}</p></>}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold mb-3">Match Your Resume</h2>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>}

          {resumes.length === 0 ? (
            <p className="text-sm text-gray-400">Upload a resume first to check your match.</p>
          ) : (
            <div className="flex gap-3 items-center mb-4">
              <select
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
              <button onClick={runMatch} disabled={matching} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                {matching ? 'Matching...' : 'Check Match'}
              </button>
            </div>
          )}

          {matchResult && (
            <div className="mt-4 border-t pt-4">
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-primary-600">{matchResult.match_score}%</p>
                  <p className="text-xs text-gray-500">Overall Match</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{matchResult.skill_score}%</p>
                  <p className="text-xs text-gray-500">Skill Match</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{matchResult.semantic_score}%</p>
                  <p className="text-xs text-gray-500">Semantic Match</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Matched Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {matchResult.matched_skills.map((s) => (
                      <span key={s} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Missing Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {matchResult.missing_skills.map((s) => (
                      <span key={s} className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
