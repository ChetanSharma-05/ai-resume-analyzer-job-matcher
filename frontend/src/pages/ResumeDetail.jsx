import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function ResumeDetail() {
  const { id } = useParams()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiSummary, setAiSummary] = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    setLoading(true)
    const { data } = await api.get(`/resumes/${id}/`)
    setResume(data)
    setLoading(false)
  }

  async function getAiSummary() {
    setAiLoading(true)
    const { data } = await api.post('/ai/resume-summary/', { resume_id: id })
    setAiSummary(data.data.summary)
    setAiLoading(false)
  }

  async function getAiSuggestions() {
    setAiLoading(true)
    const { data } = await api.post('/ai/improvement/', { resume_id: id })
    setAiSuggestions(data.data.suggestions)
    setAiLoading(false)
  }

  if (loading) return <div><Navbar /><p className="text-center mt-10 text-gray-400">Loading...</p></div>
  if (!resume) return <div><Navbar /><p className="text-center mt-10 text-gray-400">Resume not found.</p></div>

  const skills = resume.resume_skills || []

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{resume.title}</h1>
            <p className="text-sm text-gray-500">
              {resume.parsed_name || 'Name not detected'} · {resume.parsed_email || 'Email not detected'}
            </p>
          </div>
          <Link to={`/resumes/${id}/analysis`} className="text-primary-600 text-sm font-medium">Full Analysis →</Link>
        </div>

        {resume.processing_error && (
          <div className="bg-yellow-50 text-yellow-700 text-sm p-3 rounded-md mb-4">
            {resume.processing_error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-sm text-gray-500">ATS Score</p>
            <p className="text-3xl font-bold text-primary-600">{resume.ats_score != null ? `${resume.ats_score}%` : '—'}</p>
            <p className="text-xs text-gray-400 mt-1">Application-generated score, not an official ATS result</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-sm text-gray-500">Skills Detected</p>
            <p className="text-3xl font-bold text-green-600">{skills.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-3xl font-bold text-purple-600">{resume.is_processed ? 'Ready' : 'Pending'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold mb-3">Detected Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.length === 0 && <p className="text-sm text-gray-400">No skills detected yet.</p>}
            {skills.map((rs) => (
              <span key={rs.id} className="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full">
                {rs.skill.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">AI Professional Summary</h2>
            <button onClick={getAiSummary} disabled={aiLoading} className="text-sm text-primary-600 font-medium">
              {aiLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {aiSummary || 'Click "Generate" to get an AI-written professional summary based on your resume.'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">AI Improvement Suggestions</h2>
            <button onClick={getAiSuggestions} disabled={aiLoading} className="text-sm text-primary-600 font-medium">
              {aiLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {aiSuggestions || 'Click "Generate" to get suggestions for improving your resume bullets.'}
          </p>
        </div>
      </div>
    </div>
  )
}
