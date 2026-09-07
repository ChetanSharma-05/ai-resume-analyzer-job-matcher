import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResumes()
  }, [])

  async function loadResumes() {
    try {
      const { data } = await api.get('/resumes/')
      setResumes(data.results || data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const bestResume = resumes.reduce((best, r) => (r.ats_score > (best?.ats_score || 0) ? r : best), null)
  const totalSkillsEstimate = resumes.length > 0 ? '—' : 0

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold">Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!</h1>
        <p className="text-gray-500 mt-1">Here's an overview of your resume analysis.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatCard label="Best Resume Score" value={bestResume ? `${bestResume.ats_score}%` : '—'} accent="primary" />
          <StatCard label="Total Resumes" value={resumes.length} accent="green" />
          <StatCard label="Processed Resumes" value={resumes.filter(r => r.is_processed).length} accent="purple" />
          <StatCard label="Pending Analysis" value={resumes.filter(r => !r.is_processed).length} accent="orange" />
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Recent Resumes</h2>
            <Link to="/resumes/upload" className="text-sm text-primary-600 font-medium">+ Upload new</Link>
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : resumes.length === 0 ? (
            <p className="text-gray-400 text-sm">No resumes uploaded yet. Upload your first resume to get started.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">ATS Score</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {resumes.slice(0, 5).map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2">{r.title}</td>
                    <td className="py-2 uppercase text-gray-500">{r.file_type}</td>
                    <td className="py-2">{r.ats_score != null ? `${r.ats_score}%` : '—'}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${r.is_processed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.is_processed ? 'Processed' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <Link to={`/resumes/${r.id}`} className="text-primary-600 text-sm font-medium">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
