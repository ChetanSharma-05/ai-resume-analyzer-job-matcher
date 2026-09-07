import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [matchScores, setMatchScores] = useState({})
  const { user } = useAuth()

  useEffect(() => {
    load()
  }, [user])

  async function load(query = '') {
    setLoading(true)
    try {
      const { data } = await api.get('/jobs/', { params: query ? { search: query } : {} })
      const jobList = data.results || data
      setJobs(jobList)
      if (user && user.role !== 'recruiter' && user.role !== 'admin') {
        const resumeResponse = await api.get('/resumes/')
        const resumeList = resumeResponse.data.results || resumeResponse.data
        const resume = resumeList.find((item) => item.is_processed)
        if (resume) {
          const matchResponse = await api.get(`/matching/${resume.id}/`)
          const matches = matchResponse.data.data || []
          setMatchScores(Object.fromEntries(matches.map((match) => [match.job.id, match.match_score])))
        }
      }
    } catch (err) {
      setJobs([])
      setMatchScores({})
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    load(search)
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Browse Jobs</h1>

        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, company, or location..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Search
          </button>
        </form>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">
            No jobs found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <Link to={`/jobs/${job.id}`} key={job.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{job.title}</h3>{matchScores[job.id] != null && <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">{matchScores[job.id]}% match</span>}</div>
                <p className="text-sm text-gray-500">{job.company} · {job.location || 'Remote'}</p>
                <div className="flex gap-2 mt-3 text-xs text-gray-400">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{job.employment_type}</span>
                  {job.experience_required && <span className="bg-gray-100 px-2 py-1 rounded-full">{job.experience_required}</span>}
                </div>
                <p className="text-sm text-gray-500 mt-3">{job.salary || 'Salary not listed'}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
